import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthLoginForm } from '../../components/auth-login-form/auth-login-form';
import { CUSTOMER_LOGIN_FEATURES } from '../../data/provider-register.data';
import { AuthLoginPageConfig } from '../../models/auth.model';

@Component({
  selector: 'app-customer-login-page',
  imports: [AuthLayout, AuthLoginForm],
  templateUrl: './customer-login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerLoginPage {
  protected readonly features = CUSTOMER_LOGIN_FEATURES;

  protected readonly loginConfig: AuthLoginPageConfig = {
    userType: 'customer',
    heading: 'COMPRA EN AXTERI',
    subtitle: 'Accede a miles de productos y proveedores en un solo lugar.',
    identifierLabel: 'CORREO ELECTRÓNICO',
    identifierPlaceholder: 'Ingresa tu correo electrónico',
    identifierInputType: 'email',
    callbackPath: '/login/clientes',
    redirectAfterSuccess: '/',
  };
}
