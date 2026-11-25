import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../../../app.routes';
import { ClerkAuthService } from '../../services/clerk-auth.service';

describe('CustomerLoginPage', () => {
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

    harness = await RouterTestingHarness.create('/login/clientes');
    element = harness.routeNativeElement!;
  });

  it('renders customer login copy, feature panel items, and hides "Recuérdame"', () => {
    expect(element.querySelector('a[href="/registro/proveedores"]')).toBeNull();
    expect(element.querySelector('app-auth-layout')).not.toBeNull();
    expect(element.querySelector('app-auth-login-form')).not.toBeNull();
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('COMPRA EN AXTERI');
    expect(element.querySelector('.auth-layout__features-heading')?.textContent?.trim()).toBe(
      'CON AXTERI...',
    );
    expect(element.textContent).toContain('CONTACTA CON PROVEEDORES VERIFICADOS.');
    expect(element.textContent).not.toContain('Recuérdame');
  });

  it('validates email format on customer identifier input before calling Clerk', async () => {
    const emailInput = element.querySelector<HTMLInputElement>('#auth-login-identifier')!;
    const passwordInput = element.querySelector<HTMLInputElement>('#auth-login-password')!;

    emailInput.value = 'correo-invalido';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'ClaveSegura123';
    passwordInput.dispatchEvent(new Event('input'));

    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(clerkAuthMock.signInWithPassword).not.toHaveBeenCalled();
    expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
      'Ingresa un correo electrónico válido.',
    );
  });

  it('authenticates customer with email and password and redirects to home', async () => {
    const emailInput = element.querySelector<HTMLInputElement>('#auth-login-identifier')!;
    const passwordInput = element.querySelector<HTMLInputElement>('#auth-login-password')!;

    emailInput.value = 'comprador@empresa.pe';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'ClaveSegura123';
    passwordInput.dispatchEvent(new Event('input'));

    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(clerkAuthMock.signInWithPassword).toHaveBeenCalledWith({
      identifier: 'comprador@empresa.pe',
      password: 'ClaveSegura123',
      userType: 'customer',
    });
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
