import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../../../app.routes';
import { ClerkAuthService } from '../../services/clerk-auth.service';
import { ProviderRegistrationStore } from '../../services/provider-registration-store';

describe('ProviderRegisterPage', () => {
  let harness: RouterTestingHarness;
  let element: HTMLElement;
  let registrationStore: ProviderRegistrationStore;
  let clerkAuthMock: {
    startOAuthSignUp: ReturnType<typeof vi.fn>;
    submitProviderSignUpCredentials: ReturnType<typeof vi.fn>;
    verifyProviderEmailCode: ReturnType<typeof vi.fn>;
    resendProviderEmailCode: ReturnType<typeof vi.fn>;
    handleOAuthCallbackIfPresent: ReturnType<typeof vi.fn>;
    getActiveUserId: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    sessionStorage.clear();
    clerkAuthMock = {
      startOAuthSignUp: vi.fn().mockResolvedValue({ ok: true }),
      submitProviderSignUpCredentials: vi.fn().mockResolvedValue({
        ok: true,
        status: 'complete',
      }),
      verifyProviderEmailCode: vi.fn().mockResolvedValue({
        ok: true,
        status: 'complete',
      }),
      resendProviderEmailCode: vi.fn().mockResolvedValue({
        ok: true,
        status: 'needs_email_verification',
      }),
      handleOAuthCallbackIfPresent: vi.fn().mockResolvedValue({
        handled: false,
        emailAddress: null,
        fullName: null,
        clerkUserId: null,
      }),
      getActiveUserId: vi.fn().mockReturnValue('user_clerk_provider_1'),
    };

    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: ClerkAuthService, useValue: clerkAuthMock }],
    }).compileComponents();

    registrationStore = TestBed.inject(ProviderRegistrationStore);
    registrationStore.resetDraft();

    harness = await RouterTestingHarness.create('/registro/proveedores');
    element = harness.routeNativeElement!;
  });

  it('starts at Step 1 (CONTACTO), validates phone and terms, and supports OAuth', async () => {
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('VENDE EN AXTERI');
    expect(element.querySelector('.auth-layout__tab-text')?.textContent?.trim()).toBe('REGISTRO');
    expect(element.querySelector('.auth-layout__top-cta')?.textContent?.trim()).toBe(
      'Inicia Sesión',
    );

    const googleBtn = element.querySelector<HTMLButtonElement>(
      'button[data-provider="oauth_google"]',
    )!;
    googleBtn.click();
    await harness.fixture.whenStable();

    expect(clerkAuthMock.startOAuthSignUp).toHaveBeenCalledWith({
      strategy: 'oauth_google',
      userType: 'provider',
      redirectUrl: '/registro/proveedores?sso=callback',
      redirectUrlComplete: '/registro/proveedores?step=2',
    });

    // Submit empty Step 1 form -> shows phone validation error
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
      'Ingresa un número de teléfono móvil válido de 9 dígitos.',
    );

    // Fill valid phone but leave terms unchecked
    const phoneInput = element.querySelector<HTMLInputElement>('#provider-register-phone')!;
    phoneInput.value = '987654321';
    phoneInput.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
      'Debes aceptar los Términos y Condiciones para continuar.',
    );
  });

  it('completes all 4 steps including Step 2 PASSWORD field and persists commercial profile separately', async () => {
    // Step 1 -> Step 2
    const phoneInput = element.querySelector<HTMLInputElement>('#provider-register-phone')!;
    const termsCheckbox = element.querySelector<HTMLInputElement>('#provider-register-terms')!;
    phoneInput.value = '987654321';
    phoneInput.dispatchEvent(new Event('input'));
    termsCheckbox.click();
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    // Verify Step 2 (DATOS) renders password field directly under company email
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('CUÉNTANOS SOBRE TI');
    const labels = Array.from(element.querySelectorAll('.provider-register__label')).map((el) =>
      el.textContent?.trim(),
    );
    expect(labels).toEqual([
      'NOMBRE COMPLETO',
      'RUC',
      'CORREO ELECTRÓNICO DE LA EMPRESA',
      'CONTRASEÑA',
    ]);

    // Validate local RUC check in Step 2
    const fullNameInput = element.querySelector<HTMLInputElement>('#provider-register-fullname')!;
    const rucInput = element.querySelector<HTMLInputElement>('#provider-register-ruc')!;
    const emailInput = element.querySelector<HTMLInputElement>('#provider-register-email')!;
    const passwordInput = element.querySelector<HTMLInputElement>('#provider-register-password')!;

    fullNameInput.value = 'Carlos Mendoza';
    fullNameInput.dispatchEvent(new Event('input'));
    rucInput.value = '99123456789';
    rucInput.dispatchEvent(new Event('input'));
    emailInput.value = 'ventas@empresa.pe';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'ClaveEmpresa2026';
    passwordInput.dispatchEvent(new Event('input'));

    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toContain(
      'Ingresa un RUC válido de 11 dígitos',
    );
    expect(clerkAuthMock.submitProviderSignUpCredentials).not.toHaveBeenCalled();

    // Fix RUC and submit Step 2 -> advances to Step 3
    rucInput.value = '20123456789';
    rucInput.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(clerkAuthMock.submitProviderSignUpCredentials).toHaveBeenCalledWith({
      fullName: 'Carlos Mendoza',
      companyEmail: 'ventas@empresa.pe',
      password: 'ClaveEmpresa2026',
    });

    // Verify Step 3 (CATEGORÍA)
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('CUÉNTANOS SOBRE TU EMPRESA');
    const industrySelect = element.querySelector<HTMLSelectElement>('#provider-register-industry')!;
    const specialtySelect = element.querySelector<HTMLSelectElement>(
      '#provider-register-specialty',
    )!;

    industrySelect.value = 'automatizacion-control';
    industrySelect.dispatchEvent(new Event('change'));
    specialtySelect.value = 'distribuidor-autorizado';
    specialtySelect.dispatchEvent(new Event('change'));

    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    // Verify Step 4 (¡LISTO!) and commercial profile storage
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('¡FELICIDADES!');
    expect(element.textContent).toContain('TU SOLICITUD HA SIDO REGISTRADA CON ÉXITO');

    const savedProfile = registrationStore.submittedProfile();
    expect(savedProfile).toEqual(
      expect.objectContaining({
        phone: '987654321',
        acceptedTerms: true,
        fullName: 'Carlos Mendoza',
        ruc: '20123456789',
        companyEmail: 'ventas@empresa.pe',
        industry: 'automatizacion-control',
        specialty: 'distribuidor-autorizado',
        clerkUserId: 'user_clerk_provider_1',
      }),
    );

    const homeBtn = element.querySelector<HTMLButtonElement>('.provider-register__submit')!;
    expect(homeBtn.textContent?.trim()).toBe('VOLVER AL INICIO');
    homeBtn.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('handles Clerk email verification requirement in Step 2 before advancing to Step 3', async () => {
    clerkAuthMock.submitProviderSignUpCredentials.mockResolvedValueOnce({
      ok: true,
      status: 'needs_email_verification',
    });

    // Complete Step 1
    const phoneInput = element.querySelector<HTMLInputElement>('#provider-register-phone')!;
    const termsCheckbox = element.querySelector<HTMLInputElement>('#provider-register-terms')!;
    phoneInput.value = '987654321';
    phoneInput.dispatchEvent(new Event('input'));
    termsCheckbox.click();
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    // Fill Step 2
    const fullNameInput = element.querySelector<HTMLInputElement>('#provider-register-fullname')!;
    const rucInput = element.querySelector<HTMLInputElement>('#provider-register-ruc')!;
    const emailInput = element.querySelector<HTMLInputElement>('#provider-register-email')!;
    const passwordInput = element.querySelector<HTMLInputElement>('#provider-register-password')!;

    fullNameInput.value = 'Lucía Paredes';
    fullNameInput.dispatchEvent(new Event('input'));
    rucInput.value = '20555666777';
    rucInput.dispatchEvent(new Event('input'));
    emailInput.value = 'lucia@industrial.pe';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'Segura2026!';
    passwordInput.dispatchEvent(new Event('input'));

    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('VERIFICA TU CORREO ELECTRÓNICO');

    const codeInput = element.querySelector<HTMLInputElement>('#provider-register-code')!;
    codeInput.value = '654321';
    codeInput.dispatchEvent(new Event('input'));

    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(clerkAuthMock.verifyProviderEmailCode).toHaveBeenCalledWith('654321');
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('CUÉNTANOS SOBRE TU EMPRESA');
  });
});
