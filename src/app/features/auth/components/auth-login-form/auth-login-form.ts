import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthLoginPageConfig, OAuthProviderStrategy } from '../../models/auth.model';
import { ClerkAuthService } from '../../services/clerk-auth.service';
import { AuthSocialButtons } from '../auth-social-buttons/auth-social-buttons';

type LoginViewMode = 'login' | 'reset-request' | 'reset-confirm';

@Component({
  selector: 'app-auth-login-form',
  imports: [ReactiveFormsModule, AuthSocialButtons],
  templateUrl: './auth-login-form.html',
  styleUrl: './auth-login-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLoginForm implements OnInit {
  private readonly clerkAuth = inject(ClerkAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly config = input.required<AuthLoginPageConfig>();

  protected readonly viewMode = signal<LoginViewMode>('login');
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly infoMessage = signal('');

  protected readonly loginForm = new FormGroup({
    identifier: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly resetRequestForm = new FormGroup({
    identifier: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly resetConfirmForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  protected readonly identifierInvalid = computed(() => {
    const control = this.loginForm.controls.identifier;
    return control.touched && control.invalid;
  });

  constructor() {
    effect(() => {
      const currentConfig = this.config();
      const validators =
        currentConfig.identifierInputType === 'email'
          ? [Validators.required, Validators.email]
          : [Validators.required];
      this.loginForm.controls.identifier.setValidators(validators);
      this.loginForm.controls.identifier.updateValueAndValidity({ emitEvent: false });
      this.resetRequestForm.controls.identifier.setValidators(validators);
      this.resetRequestForm.controls.identifier.updateValueAndValidity({ emitEvent: false });
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.route.snapshot.queryParamMap.get('sso') === 'callback') {
      this.loading.set(true);
      const callbackResult = await this.clerkAuth.handleOAuthCallbackIfPresent(
        this.config().redirectAfterSuccess,
      );
      this.loading.set(false);
      if (callbackResult.errorMessage) {
        this.errorMessage.set(callbackResult.errorMessage);
      } else if (callbackResult.handled) {
        await this.router.navigateByUrl(this.config().redirectAfterSuccess);
      }
    }
  }

  protected async onSocialSignIn(strategy: OAuthProviderStrategy): Promise<void> {
    if (this.loading()) return;
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.loading.set(true);

    const cfg = this.config();
    const result = await this.clerkAuth.startOAuthSignIn({
      strategy,
      userType: cfg.userType,
      redirectUrl: `${cfg.callbackPath}?sso=callback`,
      redirectUrlComplete: cfg.redirectAfterSuccess,
    });

    this.loading.set(false);
    if (!result.ok && result.errorMessage) {
      this.errorMessage.set(result.errorMessage);
    }
  }

  protected async onSubmitLogin(): Promise<void> {
    if (this.loading()) return;
    this.errorMessage.set('');
    this.infoMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set(this.resolveLoginValidationError());
      return;
    }

    this.loading.set(true);
    const { identifier, password } = this.loginForm.getRawValue();
    const result = await this.clerkAuth.signInWithPassword({
      identifier,
      password,
      userType: this.config().userType,
    });
    this.loading.set(false);

    if (result.ok && result.status === 'complete') {
      await this.router.navigateByUrl(this.config().redirectAfterSuccess);
      return;
    }

    this.errorMessage.set(result.errorMessage ?? 'Usuario y/o contraseña incorrectos.');
  }

  protected openForgotPassword(): void {
    this.errorMessage.set('');
    this.infoMessage.set('');
    const currentIdentifier = this.loginForm.controls.identifier.value.trim();
    if (currentIdentifier) {
      this.resetRequestForm.controls.identifier.setValue(currentIdentifier);
    }
    this.viewMode.set('reset-request');
  }

  protected returnToLogin(): void {
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.viewMode.set('login');
  }

  protected async onSubmitResetRequest(): Promise<void> {
    if (this.loading()) return;
    this.errorMessage.set('');
    this.infoMessage.set('');

    if (this.resetRequestForm.invalid) {
      this.resetRequestForm.markAllAsTouched();
      this.errorMessage.set(
        this.config().identifierInputType === 'email'
          ? 'Ingresa un correo electrónico válido para recuperar tu contraseña.'
          : 'Ingresa tu usuario o correo electrónico para recuperar tu contraseña.',
      );
      return;
    }

    this.loading.set(true);
    const { identifier } = this.resetRequestForm.getRawValue();
    const result = await this.clerkAuth.requestPasswordReset(identifier);
    this.loading.set(false);

    if (result.ok) {
      this.infoMessage.set('Hemos enviado un código de verificación a tu correo registrado.');
      this.viewMode.set('reset-confirm');
      return;
    }

    this.errorMessage.set(result.errorMessage ?? 'No se pudo enviar el código de recuperación.');
  }

  protected async onSubmitResetConfirm(): Promise<void> {
    if (this.loading()) return;
    this.errorMessage.set('');

    if (this.resetConfirmForm.invalid) {
      this.resetConfirmForm.markAllAsTouched();
      this.errorMessage.set(
        'Ingresa el código recibido y una nueva contraseña de al menos 8 caracteres.',
      );
      return;
    }

    this.loading.set(true);
    const { code, newPassword } = this.resetConfirmForm.getRawValue();
    const result = await this.clerkAuth.confirmPasswordReset({
      code,
      newPassword,
      userType: this.config().userType,
    });
    this.loading.set(false);

    if (result.ok && result.status === 'complete') {
      await this.router.navigateByUrl(this.config().redirectAfterSuccess);
      return;
    }

    this.errorMessage.set(result.errorMessage ?? 'No se pudo restablecer la contraseña.');
  }

  private resolveLoginValidationError(): string {
    const identifierControl = this.loginForm.controls.identifier;
    if (identifierControl.hasError('email')) {
      return 'Ingresa un correo electrónico válido.';
    }
    return 'Usuario y/o contraseña incorrectos.';
  }
}
