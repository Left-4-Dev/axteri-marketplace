import type { CatalogProduct } from '../../catalog.model';
export const TABLEROS_CONTROL_PERU: readonly CatalogProduct[] = [
  {
    id: 'schneider-masterpact-mtz2-1',
    name: 'Seccionador Masterpact MTZ 2 2500A tipo HA 4P fijo',
    description:
      'Equipo eléctrico industrial diseñado para operación continua en tableros de distribución y automatización de planta.',
    price: {
      kind: 'fixed',
      amount: 31500,
      previousAmount: 32500,
      currency: 'USD',
      unitLabel: 'Por mayor',
      includesTax: true,
    },
    brandId: 'schneider-electric',
    sellerId: 'tableros-control-peru',
    categoryId: 'electrical-materials',
  },
];
