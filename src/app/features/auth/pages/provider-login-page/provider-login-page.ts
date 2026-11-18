import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthLoginForm } from '../../components/auth-login-form/auth-login-form';
import { AuthLoginPageConfig, AuthTopActionConfig } from '../../models/auth.model';

@Component({
  selector: 'app-provider-login-page',
  imports: [AuthLayout, AuthLoginForm],
  templateUrl: './provider-login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderLoginPage {
  protected readonly topAction: AuthTopActionConfig = {
    prompt: '¿Todavía no tienes una cuenta?',
    ctaLabel: 'Regístrate',
    route: '/registro/proveedores',
  };

  protected readonly loginConfig: AuthLoginPageConfig = {
    userType: 'provider',
    heading: 'ÚNETE A AXTERI',
    subtitle: 'Exhibe tus productos en nuestra plataforma digital fácilmente.',
    identifierLabel: 'USUARIO',
    identifierPlaceholder: 'Ingresa tu usuario',
    identifierInputType: 'text',
    callbackPath: '/login/proveedores',
    redirectAfterSuccess: '/',
  };
}
