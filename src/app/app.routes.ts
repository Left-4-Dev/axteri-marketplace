import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login/proveedores',
    title: 'Iniciar sesión proveedores | Axteri Marketplace',
    loadComponent: () =>
      import('./features/auth/pages/provider-login-page/provider-login-page').then(
        (m) => m.ProviderLoginPage,
      ),
  },
  {
    path: 'login/clientes',
    title: 'Iniciar sesión clientes | Axteri Marketplace',
    loadComponent: () =>
      import('./features/auth/pages/customer-login-page/customer-login-page').then(
        (m) => m.CustomerLoginPage,
      ),
  },
  {
    path: 'registro/proveedores',
    title: 'Registro de proveedores | Axteri Marketplace',
    loadComponent: () =>
      import('./features/auth/pages/provider-register-page/provider-register-page').then(
        (m) => m.ProviderRegisterPage,
      ),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'proveedores/:id',
        title: 'Perfil del proveedor | Axteri Marketplace',
        loadComponent: () =>
          import('./features/sellers/pages/seller-profile-page/seller-profile-page').then(
            (m) => m.SellerProfilePage,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        title: 'Axteri Marketplace',
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page').then((m) => m.HomePage),
      },
      {
        path: 'productos/:id',
        title: 'Detalle de producto | Axteri Marketplace',
        loadComponent: () =>
          import('./features/products/pages/product-detail-page/product-detail-page').then(
            (m) => m.ProductDetailPage,
          ),
      },
      {
        path: 'productos',
        title: 'Productos | Axteri Marketplace',
        loadComponent: () =>
          import('./features/products/pages/product-list-page/product-list-page').then(
            (m) => m.ProductListPage,
          ),
      },
    ],
  },
];
