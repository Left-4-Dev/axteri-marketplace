import type { CatalogProduct } from '../../catalog.model';
export const AUTOMATIZACION_ANDINA: readonly CatalogProduct[] = [
  {
    id: 'siemens-simotics',
    name: 'Simotics SD 1LE1002-1BB22 motor eléctrico trifásico',
    price: {
      kind: 'fixed',
      amount: 1200,
      previousAmount: 1500,
      currency: 'PEN',
      unitLabel: 'Por unidad',
      includesTax: true,
    },
    brandId: 'siemens',
    sellerId: 'automatizacion-andina',
    categoryId: 'power-transmission',
  },
];
