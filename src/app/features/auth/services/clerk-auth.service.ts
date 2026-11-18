import { DOCUMENT } from '@angular/core';
import { Injectable, inject, signal } from '@angular/core';
import { Clerk, isClerkAPIResponseError } from '@clerk/clerk-js';
import {
  AuthActionResult,
  AuthSessionUser,
  AuthUserType,
  ClerkRuntimeConfig,
  OAuthProviderStrategy,
} from '../models/auth.model';

const USER_TYPE_STORAGE_KEY = 'axteri.auth.userType';

/**
 * Browser boundary for Clerk authentication (`@clerk/clerk-js`).
 *
 * Security & production notes:
 * - Reads only the public `publishableKey` from `/config/clerk.local.json` (or `window.__clerk_publishable_key`).
 * - Never uses `CLERK_SECRET_KEY` on the frontend.
 * - `userType: 'customer' | 'provider'` is persisted in `unsafeMetadata` / `sessionStorage` strictly for
 *   frontend flow classification. In production, authorization decisions MUST rely on backend-verified
 *   roles (`publicMetadata` written via Clerk Backend SDK / webhooks) and never on client-editable metadata.
 * - Session duration / "Recuérdame" is managed by Clerk's session configuration rather than manual frontend tokens.
 */
@Injectable({ providedIn: 'root' })
export class ClerkAuthService {
  private readonly document = inject(DOCUMENT);
  private configRequest?: Promise<ClerkRuntimeConfig | null>;
  private clerkRequest?: Promise<Clerk | null>;

  readonly initialized = signal(false);
  readonly configured = signal(false);
  readonly sessionUser = signal<AuthSessionUser | null>(null);
  readonly activeUserType = signal<AuthUserType>(this.readStoredUserType() ?? 'customer');

  configuration(): Promise<ClerkRuntimeConfig | null> {
    return (this.configRequest ??= this.readConfiguration());
  }

  async ensureClerk(): Promise<Clerk | null> {
    return (this.clerkRequest ??= this.loadClerk());
  }

  async signInWithPassword(params: {
    identifier: string;
    password: string;
    userType: AuthUserType;
  }): Promise<AuthActionResult> {
    const clerk = await this.ensureClerk();
    if (!clerk?.client) {
      return this.unconfiguredResult();
    }

    try {
      const signIn = await clerk.client.signIn.create({
        strategy: 'password',
        identifier: params.identifier.trim(),
        password: params.password,
      });

      if (signIn.status === 'complete' && signIn.createdSessionId) {
        await clerk.setActive({ session: signIn.createdSessionId });
        this.persistUserType(params.userType);
        this.syncSessionUser(clerk, params.userType);
        return { ok: true, status: 'complete' };
      }

      if (signIn.status === 'needs_second_factor') {
        return {
          ok: false,
          status: 'needs_second_factor',
          errorMessage: 'Tu cuenta requiere un segundo factor de verificación para continuar.',
        };
      }

      return {
        ok: false,
        errorMessage: 'Usuario y/o contraseña incorrectos.',
      };
    } catch (error) {
      return {
        ok: false,
        errorMessage: this.mapSignInError(error),
      };
    }
  }

  async startOAuthSignIn(params: {
    strategy: OAuthProviderStrategy;
    userType: AuthUserType;
    redirectUrl: string;
    redirectUrlComplete: string;
  }): Promise<AuthActionResult> {
    const clerk = await this.ensureClerk();
    if (!clerk?.client) {
      return this.unconfiguredResult();
    }

    try {
      this.persistUserType(params.userType);
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: params.strategy,
        redirectUrl: this.toAbsoluteUrl(params.redirectUrl),
        redirectUrlComplete: this.toAbsoluteUrl(params.redirectUrlComplete),
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        errorMessage: this.mapGenericError(
          error,
          'No se pudo iniciar la autenticación social. Verifica el proveedor en Clerk Dashboard.',
        ),
      };
    }
  }

  async startOAuthSignUp(params: {
    strategy: OAuthProviderStrategy;
    userType: AuthUserType;
    redirectUrl: string;
    redirectUrlComplete: string;
  }): Promise<AuthActionResult> {
    const clerk = await this.ensureClerk();
    if (!clerk?.client) {
      return this.unconfiguredResult();
    }

    try {
      this.persistUserType(params.userType);
      await clerk.client.signUp.authenticateWithRedirect({
        strategy: params.strategy,
        redirectUrl: this.toAbsoluteUrl(params.redirectUrl),
        redirectUrlComplete: this.toAbsoluteUrl(params.redirectUrlComplete),
        legalAccepted: true,
        unsafeMetadata: {
          userType: params.userType,
        },
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        errorMessage: this.mapGenericError(
          error,
          'No se pudo iniciar el registro social. Verifica el proveedor en Clerk Dashboard.',
        ),
      };
    }
  }

  async handleOAuthCallbackIfPresent(redirectUrlComplete: string): Promise<{
    handled: boolean;
    emailAddress: string | null;
    fullName: string | null;
    clerkUserId: string | null;
    errorMessage?: string;
  }> {
    const clerk = await this.ensureClerk();
    if (!clerk) {
      return {
        handled: false,
        emailAddress: null,
        fullName: null,
        clerkUserId: null,
      };
    }

    try {
      await clerk.handleRedirectCallback({
        signInFallbackRedirectUrl: this.toAbsoluteUrl(redirectUrlComplete),
        signUpFallbackRedirectUrl: this.toAbsoluteUrl(redirectUrlComplete),
      });
      const user = clerk.user;
      const signUp = clerk.client?.signUp;
      const firstName = user?.firstName ?? signUp?.firstName ?? '';
      const lastName = user?.lastName ?? signUp?.lastName ?? '';
      const fullName = `${firstName} ${lastName}`.trim() || null;
      const emailAddress = user?.primaryEmailAddress?.emailAddress ?? signUp?.emailAddress ?? null;

      this.syncSessionUser(clerk, this.activeUserType());

      return {
        handled: true,
        emailAddress,
        fullName,
        clerkUserId: user?.id ?? signUp?.createdUserId ?? null,
      };
    } catch (error) {
      return {
        handled: true,
        emailAddress: null,
        fullName: null,
        clerkUserId: null,
        errorMessage: this.mapGenericError(
          error,
          'No fue posible completar la autenticación social.',
        ),
      };
    }
  }

  /**
   * Starts or updates the Clerk SignUp lifecycle at Paso 2 (DATOS), once the user
   * has provided fullName, companyEmail, and password (after accepting terms in Paso 1).
   */
  async submitProviderSignUpCredentials(params: {
    fullName: string;
    companyEmail: string;
    password: string;
  }): Promise<AuthActionResult> {
    const clerk = await this.ensureClerk();
    if (!clerk?.client) {
      return this.unconfiguredResult();
    }

    const { firstName, lastName } = this.splitFullName(params.fullName);

    try {
      this.persistUserType('provider');
      const existingSignUp = clerk.client.signUp;
      const payload = {
        firstName,
        lastName,
        emailAddress: params.companyEmail.trim(),
        password: params.password,
        legalAccepted: true,
        unsafeMetadata: {
          userType: 'provider' as const,
        },
      };

      const signUp =
        existingSignUp?.id && existingSignUp.status === 'missing_requirements'
          ? await existingSignUp.update(payload)
          : await clerk.client.signUp.create(payload);

      if (signUp.status === 'complete' && signUp.createdSessionId) {
        await clerk.setActive({ session: signUp.createdSessionId });
        this.syncSessionUser(clerk, 'provider');
        return { ok: true, status: 'complete' };
      }

      if (signUp.unverifiedFields?.includes('email_address')) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        return {
          ok: true,
          status: 'needs_email_verification',
        };
      }

      return {
        ok: true,
        status: 'complete',
      };
    } catch (error) {
      return {
        ok: false,
        errorMessage: this.mapSignUpError(error),
      };
    }
  }

  async verifyProviderEmailCode(code: string): Promise<AuthActionResult> {
    const clerk = await this.ensureClerk();
    if (!clerk?.client) {
      return this.unconfiguredResult();
    }

    try {
      const signUp = await clerk.client.signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (signUp.status === 'complete' && signUp.createdSessionId) {
        await clerk.setActive({ session: signUp.createdSessionId });
        this.syncSessionUser(clerk, 'provider');
        return { ok: true, status: 'complete' };
      }

      return {
        ok: false,
        errorMessage: 'El código de verificación no pudo completarse. Inténtalo nuevamente.',
      };
    } catch (error) {
      return {
        ok: false,
        errorMessage: this.mapGenericError(error, 'El código ingresado es inválido o ha expirado.'),
      };
    }
  }

  async resendProviderEmailCode(): Promise<AuthActionResult> {
    const clerk = await this.ensureClerk();
    if (!clerk?.client) {
      return this.unconfiguredResult();
    }

    try {
      await clerk.client.signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      return { ok: true, status: 'needs_email_verification' };
    } catch (error) {
      return {
        ok: false,
        errorMessage: this.mapGenericError(error, 'No se pudo reenviar el código de verificación.'),
      };
    }
  }

  async requestPasswordReset(identifier: string): Promise<AuthActionResult> {
    const clerk = await this.ensureClerk();
    if (!clerk?.client) {
      return this.unconfiguredResult();
    }

    try {
      await clerk.client.signIn.create({
        strategy: 'reset_password_email_code',
        identifier: identifier.trim(),
      });
      return {
        ok: true,
        status: 'reset_code_sent',
      };
    } catch (error) {
      return {
        ok: false,
        errorMessage: this.mapGenericError(
          error,
          'No se pudo enviar el código de recuperación. Verifica tu correo o usuario.',
        ),
      };
    }
  }

  async confirmPasswordReset(params: {
    code: string;
    newPassword: string;
    userType: AuthUserType;
  }): Promise<AuthActionResult> {
    const clerk = await this.ensureClerk();
    if (!clerk?.client) {
      return this.unconfiguredResult();
    }

    try {
      const signIn = await clerk.client.signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: params.code.trim(),
        password: params.newPassword,
      });

      if (signIn.status === 'complete' && signIn.createdSessionId) {
        await clerk.setActive({ session: signIn.createdSessionId });
        this.persistUserType(params.userType);
        this.syncSessionUser(clerk, params.userType);
        return { ok: true, status: 'complete' };
      }

      return {
        ok: false,
        errorMessage: 'No se pudo completar el cambio de contraseña.',
      };
    } catch (error) {
      return {
        ok: false,
        errorMessage: this.mapGenericError(
          error,
          'El código o la nueva contraseña no cumplen los requisitos de seguridad.',
        ),
      };
    }
  }

  getActiveUserId(): string | null {
    return this.sessionUser()?.id ?? null;
  }

  protected createClerkInstance(publishableKey: string): Clerk {
    return new Clerk(publishableKey);
  }

  private async loadClerk(): Promise<Clerk | null> {
    const config = await this.configuration();
    if (!config?.publishableKey) {
      this.configured.set(false);
      this.initialized.set(true);
      return null;
    }

    try {
      const clerk = this.createClerkInstance(config.publishableKey);
      await clerk.load();
      this.configured.set(true);
      this.initialized.set(true);
      this.syncSessionUser(clerk, this.activeUserType());
      return clerk;
    } catch {
      this.configured.set(false);
      this.initialized.set(true);
      return null;
    }
  }

  private async readConfiguration(): Promise<ClerkRuntimeConfig | null> {
    const browser = this.document.defaultView;
    if (!browser) return null;

    const windowKey = browser.__clerk_publishable_key?.trim();
    if (windowKey) {
      return { publishableKey: windowKey };
    }

    try {
      const response = await fetch(new URL('config/clerk.local.json', this.document.baseURI), {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return null;
      const config = (await response.json()) as Partial<ClerkRuntimeConfig>;
      const publishableKey =
        typeof config.publishableKey === 'string' ? config.publishableKey.trim() : '';
      return publishableKey ? { publishableKey } : null;
    } catch {
      return null;
    }
  }

  private syncSessionUser(clerk: Clerk, fallbackType: AuthUserType): void {
    const user = clerk.user;
    if (!user) {
      this.sessionUser.set(null);
      return;
    }

    const metadataType = user.unsafeMetadata?.['userType'];
    const resolvedType: AuthUserType =
      metadataType === 'provider' || metadataType === 'customer' ? metadataType : fallbackType;

    this.sessionUser.set({
      id: user.id,
      emailAddress: user.primaryEmailAddress?.emailAddress ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      userType: resolvedType,
    });
  }

  private persistUserType(userType: AuthUserType): void {
    this.activeUserType.set(userType);
    try {
      this.document.defaultView?.sessionStorage?.setItem(USER_TYPE_STORAGE_KEY, userType);
    } catch {
      // Ignore storage restrictions.
    }
  }

  private readStoredUserType(): AuthUserType | null {
    try {
      const value = this.document.defaultView?.sessionStorage?.getItem(USER_TYPE_STORAGE_KEY);
      return value === 'provider' || value === 'customer' ? value : null;
    } catch {
      return null;
    }
  }

  private splitFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { firstName: '', lastName: '' };
    }
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }

  private toAbsoluteUrl(pathOrUrl: string): string {
    try {
      return new URL(pathOrUrl, this.document.baseURI).toString();
    } catch {
      return pathOrUrl;
    }
  }

  private unconfiguredResult(): AuthActionResult {
    return {
      ok: false,
      errorMessage:
        'Autenticación Clerk no configurada. Define publishableKey en public/config/clerk.local.json.',
    };
  }

  private mapSignInError(error: unknown): string {
    if (isClerkAPIResponseError(error)) {
      const firstCode = error.errors[0]?.code;
      if (
        firstCode === 'form_identifier_not_found' ||
        firstCode === 'form_password_incorrect' ||
        firstCode === 'form_param_format_invalid' ||
        firstCode === 'strategy_for_user_invalid'
      ) {
        return 'Usuario y/o contraseña incorrectos.';
      }
      return error.errors[0]?.longMessage || 'Usuario y/o contraseña incorrectos.';
    }
    return 'Usuario y/o contraseña incorrectos.';
  }

  private mapSignUpError(error: unknown): string {
    if (isClerkAPIResponseError(error)) {
      const firstCode = error.errors[0]?.code;
      if (firstCode === 'form_identifier_exists') {
        return 'Este correo electrónico ya está registrado en Axteri.';
      }
      if (firstCode === 'form_password_pwned' || firstCode === 'form_password_length_too_short') {
        return 'La contraseña debe tener al menos 8 caracteres y ser segura.';
      }
      return (
        error.errors[0]?.longMessage ||
        'No se pudieron registrar tus credenciales. Verifica los datos ingresados.'
      );
    }
    return 'No se pudieron registrar tus credenciales. Verifica los datos ingresados.';
  }

  private mapGenericError(error: unknown, fallback: string): string {
    if (isClerkAPIResponseError(error)) {
      return error.errors[0]?.longMessage || error.errors[0]?.message || fallback;
    }
    return fallback;
  }
}
