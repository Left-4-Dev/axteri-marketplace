import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthSocialButtons } from '../../components/auth-social-buttons/auth-social-buttons';
import { AuthStepper } from '../../components/auth-stepper/auth-stepper';
import {
  PROVIDER_INDUSTRIES,
  PROVIDER_REGISTER_STEP_3_FEATURES,
  PROVIDER_SPECIALTIES,
} from '../../data/provider-register.data';
import {
  AuthPanelVariant,
  AuthTopActionConfig,
  OAuthProviderStrategy,
  ProviderRegisterStep,
} from '../../models/auth.model';
import { ClerkAuthService } from '../../services/clerk-auth.service';
import { ProviderRegistrationStore } from '../../services/provider-registration-store';

export const PERU_FLAG_ASSET = '/assets/icons/auth/flag-pe.svg';
const PERU_PHONE_PATTERN = /^\d{9}$/;
const PERU_RUC_PATTERN = /^(10|15|17|20)\d{9}$/;

@Component({
  selector: 'app-provider-register-page',
  imports: [ReactiveFormsModule, AuthLayout, AuthSocialButtons, AuthStepper],
  templateUrl: './provider-register-page.html',
  styleUrl: './provider-register-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderRegisterPage implements OnInit {
  private readonly clerkAuth = inject(ClerkAuthService);
  private readonly registrationStore = inject(ProviderRegistrationStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly flagAssetPath = PERU_FLAG_ASSET;
  protected readonly flagAssetLoaded = signal(false);

  protected readonly currentStep = signal<ProviderRegisterStep>(1);
  protected readonly awaitingEmailVerification = signal(false);
  protected readonly oauthAuthenticated = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly infoMessage = signal('');

  protected readonly industries = PROVIDER_INDUSTRIES;
  protected readonly specialties = PROVIDER_SPECIALTIES;
  protected readonly step3Features = PROVIDER_REGISTER_STEP_3_FEATURES;

  protected readonly panelVariant = computed<AuthPanelVariant>(() => {
    switch (this.currentStep()) {
      case 1:
        return 'constellation';
      case 2:
        return 'b2b-hero';
      case 3:
        return 'features';
      case 4:
        return 'success';
    }
  });

  protected readonly topAction = computed<AuthTopActionConfig | null>(() =>
    this.currentStep() < 4
      ? {
          prompt: '¿Ya tienes una cuenta?',
          ctaLabel: 'Inicia Sesión',
          route: '/login/proveedores',
        }
      : null,
  );

  protected readonly step1Form = new FormGroup({
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(PERU_PHONE_PATTERN)],
    }),
    acceptedTerms: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  protected readonly step2Form = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    ruc: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(PERU_RUC_PATTERN)],
    }),
    companyEmail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  protected readonly verificationForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  protected readonly step3Form = new FormGroup({
    industry: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    specialty: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  async ngOnInit(): Promise<void> {
    this.hydrateFromStore();

    if (this.route.snapshot.queryParamMap.get('sso') === 'callback') {
      this.loading.set(true);
      const callbackResult = await this.clerkAuth.handleOAuthCallbackIfPresent(
        '/registro/proveedores?step=2',
      );
      this.loading.set(false);

      if (callbackResult.errorMessage) {
        this.errorMessage.set(callbackResult.errorMessage);
        return;
      }

      if (callbackResult.handled) {
        this.registrationStore.applyOAuthProfile({
          fullName: callbackResult.fullName,
          emailAddress: callbackResult.emailAddress,
        });
        this.hydrateFromStore();
        this.currentStep.set(2);
      }
    }
  }

  protected onFlagLoad(): void {
    this.flagAssetLoaded.set(true);
  }

  protected onFlagError(): void {
    this.flagAssetLoaded.set(false);
  }

  protected async onSocialRegister(strategy: OAuthProviderStrategy): Promise<void> {
    if (this.loading()) return;
    this.errorMessage.set('');
    this.infoMessage.set('');

    const { phone, acceptedTerms } = this.step1Form.getRawValue();
    this.registrationStore.markOAuthInitiated({ phone, acceptedTerms: acceptedTerms || true });

    this.loading.set(true);
    const result = await this.clerkAuth.startOAuthSignUp({
      strategy,
      userType: 'provider',
      redirectUrl: '/registro/proveedores?sso=callback',
      redirectUrlComplete: '/registro/proveedores?step=2',
    });
    this.loading.set(false);

    if (!result.ok && result.errorMessage) {
      this.errorMessage.set(result.errorMessage);
    }
  }

  protected onSubmitStep1(): void {
    if (this.loading()) return;
    this.errorMessage.set('');

    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      if (this.step1Form.controls.phone.invalid) {
        this.errorMessage.set('Ingresa un número de teléfono móvil válido de 9 dígitos.');
      } else if (this.step1Form.controls.acceptedTerms.invalid) {
        this.errorMessage.set('Debes aceptar los Términos y Condiciones para continuar.');
      }
      return;
    }

    const { phone, acceptedTerms } = this.step1Form.getRawValue();
    this.registrationStore.updateStep1({ phone, acceptedTerms });
    this.currentStep.set(2);
  }

  protected async onSubmitStep2(): Promise<void> {
    if (this.loading()) return;
    this.errorMessage.set('');
    this.infoMessage.set('');

    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      this.errorMessage.set(this.resolveStep2ValidationError());
      return;
    }

    const { fullName, ruc, companyEmail, password } = this.step2Form.getRawValue();

    if (this.oauthAuthenticated()) {
      this.registrationStore.updateStep2({
        fullName,
        ruc,
        companyEmail,
        emailVerified: true,
      });
      this.currentStep.set(3);
      return;
    }

    this.loading.set(true);
    const result = await this.clerkAuth.submitProviderSignUpCredentials({
      fullName,
      companyEmail,
      password,
    });
    this.loading.set(false);

    if (!result.ok) {
      this.errorMessage.set(
        result.errorMessage ?? 'No se pudieron registrar tus credenciales en Clerk.',
      );
      return;
    }

    if (result.status === 'needs_email_verification') {
      this.registrationStore.updateStep2({
        fullName,
        ruc,
        companyEmail,
        emailVerified: false,
      });
      this.awaitingEmailVerification.set(true);
      this.infoMessage.set(
        `Enviamos un código de verificación a ${companyEmail.trim()}. Ingresa el código para continuar.`,
      );
      return;
    }

    this.registrationStore.updateStep2({
      fullName,
      ruc,
      companyEmail,
      emailVerified: true,
    });
    this.currentStep.set(3);
  }

  protected async onSubmitEmailVerification(): Promise<void> {
    if (this.loading()) return;
    this.errorMessage.set('');

    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      this.errorMessage.set('Ingresa el código de verificación enviado a tu correo.');
      return;
    }

    this.loading.set(true);
    const { code } = this.verificationForm.getRawValue();
    const result = await this.clerkAuth.verifyProviderEmailCode(code);
    this.loading.set(false);

    if (result.ok && result.status === 'complete') {
      this.awaitingEmailVerification.set(false);
      this.registrationStore.markEmailVerified();
      this.currentStep.set(3);
      return;
    }

    this.errorMessage.set(result.errorMessage ?? 'El código ingresado es inválido o ha expirado.');
  }

  protected async onResendVerificationCode(): Promise<void> {
    if (this.loading()) return;
    this.errorMessage.set('');
    this.loading.set(true);
    const result = await this.clerkAuth.resendProviderEmailCode();
    this.loading.set(false);

    if (result.ok) {
      this.infoMessage.set('Se ha reenviado un nuevo código a tu correo empresarial.');
      return;
    }

    this.errorMessage.set(result.errorMessage ?? 'No se pudo reenviar el código.');
  }

  protected onSubmitStep3(): void {
    if (this.loading()) return;
    this.errorMessage.set('');

    if (this.step3Form.invalid) {
      this.step3Form.markAllAsTouched();
      this.errorMessage.set('Selecciona el rubro y la especialidad de tu empresa.');
      return;
    }

    const { industry, specialty } = this.step3Form.getRawValue();
    this.registrationStore.completeRegistration({
      industry,
      specialty,
      clerkUserId: this.clerkAuth.getActiveUserId(),
    });
    this.currentStep.set(4);
  }

  protected async onBackToHome(): Promise<void> {
    this.registrationStore.resetDraft();
    await this.router.navigateByUrl('/');
  }

  private hydrateFromStore(): void {
    const draft = this.registrationStore.draft();
    if (draft.phone) {
      this.step1Form.controls.phone.setValue(draft.phone);
    }
    if (draft.acceptedTerms) {
      this.step1Form.controls.acceptedTerms.setValue(draft.acceptedTerms);
    }
    if (draft.fullName) {
      this.step2Form.controls.fullName.setValue(draft.fullName);
    }
    if (draft.ruc) {
      this.step2Form.controls.ruc.setValue(draft.ruc);
    }
    if (draft.companyEmail) {
      this.step2Form.controls.companyEmail.setValue(draft.companyEmail);
    }
    if (draft.industry) {
      this.step3Form.controls.industry.setValue(draft.industry);
    }
    if (draft.specialty) {
      this.step3Form.controls.specialty.setValue(draft.specialty);
    }
    this.oauthAuthenticated.set(draft.oauthAuthenticated);

    const requestedStep = Number(this.route.snapshot.queryParamMap.get('step'));
    if (requestedStep === 2 && (draft.acceptedTerms || draft.oauthAuthenticated)) {
      this.currentStep.set(2);
    }
  }

  private resolveStep2ValidationError(): string {
    const controls = this.step2Form.controls;
    if (controls.fullName.invalid) {
      return 'Ingresa tu nombre completo.';
    }
    if (controls.ruc.invalid) {
      return 'Ingresa un RUC válido de 11 dígitos (iniciado en 10, 15, 17 o 20).';
    }
    if (controls.companyEmail.invalid) {
      return 'Ingresa un correo electrónico corporativo válido.';
    }
    if (controls.password.invalid) {
      return 'Ingresa una contraseña de al menos 8 caracteres.';
    }
    return 'Completa todos los campos correctamente.';
  }
}
