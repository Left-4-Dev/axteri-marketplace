import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
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
