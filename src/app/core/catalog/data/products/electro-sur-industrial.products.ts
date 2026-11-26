import type { CatalogProduct } from '../../catalog.model';
export const ELECTRO_SUR_INDUSTRIAL: readonly CatalogProduct[] = [
  {
    id: 'schneider-c60h-dc-1',
    name: 'Interruptor termomagnético - C60H-DC - 2X20A - 20kA/2',
    description:
      'Equipo eléctrico industrial diseñado para operación continua en tableros de distribución y automatización de planta.',
    price: {
      kind: 'fixed',
      amount: 50,
      currency: 'PEN',
      unitLabel: 'Por unidad',
      includesTax: true,
    },
    brandId: 'schneider-electric',
    sellerId: 'electro-sur-industrial',
    categoryId: 'electrical-materials',
  },
  {
    id: 'schneider-llave-fuerza-1',
    name: 'Llave de fuerza de 175/250 Amp marca Schneider Electric',
    description:
      'Equipo eléctrico industrial diseñado para operación continua en tableros de distribución y automatización de planta.',
    minOrderLabel: 'Pedido mínimo: 3 unidades',
    price: {
      kind: 'fixed',
      amount: 450,
      previousAmount: 500,
      currency: 'PEN',
      unitLabel: 'Por unidad',
      includesTax: true,
    },
    brandId: 'schneider-electric',
    sellerId: 'electro-sur-industrial',
    categoryId: 'electrical-materials',
  },
];
