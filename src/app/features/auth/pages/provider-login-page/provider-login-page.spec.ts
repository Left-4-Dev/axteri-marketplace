import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../../../app.routes';
import { ClerkAuthService } from '../../services/clerk-auth.service';

describe('ProviderLoginPage', () => {
  let harness: RouterTestingHarness;
  let element: HTMLElement;
  let clerkAuthMock: {
    signInWithPassword: ReturnType<typeof vi.fn>;
    startOAuthSignIn: ReturnType<typeof vi.fn>;
    requestPasswordReset: ReturnType<typeof vi.fn>;
    confirmPasswordReset: ReturnType<typeof vi.fn>;
    handleOAuthCallbackIfPresent: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    clerkAuthMock = {
      signInWithPassword: vi.fn().mockResolvedValue({ ok: true, status: 'complete' }),
      startOAuthSignIn: vi.fn().mockResolvedValue({ ok: true }),
      requestPasswordReset: vi.fn().mockResolvedValue({ ok: true, status: 'reset_code_sent' }),
      confirmPasswordReset: vi.fn().mockResolvedValue({ ok: true, status: 'complete' }),
      handleOAuthCallbackIfPresent: vi.fn().mockResolvedValue({
        handled: false,
        emailAddress: null,
        fullName: null,
        clerkUserId: null,
      }),
    };

    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: ClerkAuthService, useValue: clerkAuthMock }],
    }).compileComponents();

    harness = await RouterTestingHarness.create('/login/proveedores');
    element = harness.routeNativeElement!;
  });

  it('renders the provider login target copy, Register link, and hides "Recuérdame"', () => {
    expect(element.querySelector('app-auth-layout')).not.toBeNull();
    expect(element.querySelector('app-auth-login-form')).not.toBeNull();
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('ÚNETE A AXTERI');
    expect(element.querySelector('.auth-layout__tab-text')?.textContent?.trim()).toBe(
      'INICIO DE SESIÓN',
    );

    const registerCta = element.querySelector<HTMLAnchorElement>('.auth-layout__top-cta')!;
    expect(registerCta.textContent?.trim()).toBe('Regístrate');
    expect(registerCta.getAttribute('href')).toBe('/registro/proveedores');

    // Approved decision #2: "Recuérdame" must be hidden.
    expect(element.textContent).not.toContain('Recuérdame');
    expect(element.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('shows validation error when submitting empty credentials and does not call Clerk', async () => {
    const form = element.querySelector<HTMLFormElement>('form')!;
    form.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(clerkAuthMock.signInWithPassword).not.toHaveBeenCalled();
    expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
      'Usuario y/o contraseña incorrectos.',
    );
  });

  it('authenticates provider credentials via ClerkAuthService and redirects to home', async () => {
    const identifierInput = element.querySelector<HTMLInputElement>('#auth-login-identifier')!;
    const passwordInput = element.querySelector<HTMLInputElement>('#auth-login-password')!;

    identifierInput.value = 'proveedor@empresa.pe';
    identifierInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'AxteriSegura123';
    passwordInput.dispatchEvent(new Event('input'));

    const form = element.querySelector<HTMLFormElement>('form')!;
    form.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(clerkAuthMock.signInWithPassword).toHaveBeenCalledWith({
      identifier: 'proveedor@empresa.pe',
      password: 'AxteriSegura123',
      userType: 'provider',
    });
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('triggers Google and LinkedIn OAuth sign-in for provider', async () => {
    const googleBtn = element.querySelector<HTMLButtonElement>(
      'button[data-provider="oauth_google"]',
    )!;
    googleBtn.click();
    await harness.fixture.whenStable();

    expect(clerkAuthMock.startOAuthSignIn).toHaveBeenCalledWith({
      strategy: 'oauth_google',
      userType: 'provider',
      redirectUrl: '/login/proveedores?sso=callback',
      redirectUrlComplete: '/',
    });

    const linkedInBtn = element.querySelector<HTMLButtonElement>(
      'button[data-provider="oauth_linkedin_oidc"]',
    )!;
    linkedInBtn.click();
    await harness.fixture.whenStable();

    expect(clerkAuthMock.startOAuthSignIn).toHaveBeenCalledWith({
      strategy: 'oauth_linkedin_oidc',
      userType: 'provider',
      redirectUrl: '/login/proveedores?sso=callback',
      redirectUrlComplete: '/',
    });
  });

  it('completes the forgot password flow via ClerkAuthService', async () => {
    const forgotBtn = element.querySelector<HTMLButtonElement>('.auth-login__forgot-link')!;
    forgotBtn.click();
    await harness.fixture.whenStable();

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('RECUPERA TU CONTRASEÑA');

    const resetIdentifier = element.querySelector<HTMLInputElement>('#auth-reset-identifier')!;
    resetIdentifier.value = 'proveedor@empresa.pe';
    resetIdentifier.dispatchEvent(new Event('input'));

    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(clerkAuthMock.requestPasswordReset).toHaveBeenCalledWith('proveedor@empresa.pe');
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('NUEVA CONTRASEÑA');

    const codeInput = element.querySelector<HTMLInputElement>('#auth-reset-code')!;
    const newPasswordInput = element.querySelector<HTMLInputElement>('#auth-reset-new-password')!;
    codeInput.value = '123456';
    codeInput.dispatchEvent(new Event('input'));
    newPasswordInput.value = 'NuevaClave2026!';
    newPasswordInput.dispatchEvent(new Event('input'));

    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(clerkAuthMock.confirmPasswordReset).toHaveBeenCalledWith({
      code: '123456',
      newPassword: 'NuevaClave2026!',
      userType: 'provider',
    });
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
