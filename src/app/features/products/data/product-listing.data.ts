import { Product } from '../../../models/product.model';
import { ProductListingSummary } from '../models/product-listing.model';

export const PRODUCT_LISTING_SUMMARY: ProductListingSummary = {
  categoryTitle: 'Automatización industrial y tecnología',
  totalResults: 230,
  breadcrumbs: [{ label: 'Inicio', routerLink: '/' }, { label: 'Productos' }],
};

const verifiedLimaSeller = {
  name: 'LDF Projects',
  location: 'San Miguel, Lima',
  years: 20,
  verified: true,
} as const;

const verifiedTacnaSeller = {
  name: 'LDF Projects',
  location: 'Coronel Gregorio Albarracín Lanchipa, Tacna',
  years: 20,
  verified: true,
} as const;

const sampleDescription =
  'Equipo eléctrico industrial diseñado para operación continua en tableros de distribución y automatización de planta.';

// Datos temporales de demostración para validar vistas Grid y List sin backend.
export const PRODUCT_LISTING_ITEMS: readonly Product[] = [
  {
    id: 'schneider-sm6-qm-1',
    brand: 'Schneider',
    name: 'Celda c/seccionador fusible SM6 QM 24kV, 630A',
    description: sampleDescription,
    badge: 'Nuevo lanzamiento',
    price: {
      kind: 'range',
      min: 20000,
      max: 21000,
      currency: 'PEN',
      unitLabel: 'Por mayor',
      includesTax: true,
    },
    seller: verifiedLimaSeller,
  },
  {
    id: 'schneider-dm1a-1',
    brand: 'Schneider',
    name: 'Celda c/interruptor DM1 A 24kV 630A 20kA con relé',
    description: sampleDescription,
    minOrderLabel: 'Pedido mínimo: 3 unidades',
    price: {
      kind: 'quote',
    },
    seller: verifiedLimaSeller,
  },
  {
    id: 'schneider-c60h-dc-1',
    brand: 'Schneider',
    name: 'Interruptor termomagnético - C60H-DC - 2X20A - 20kA/2',
    description: sampleDescription,
    price: {
      kind: 'fixed',
      amount: 50,
      currency: 'PEN',
      unitLabel: 'Por unidad',
      includesTax: true,
    },
    seller: verifiedTacnaSeller,
  },
  {
    id: 'schneider-llave-fuerza-1',
    brand: 'Schneider',
    name: 'Llave de fuerza de 175/250 Amp marca Schneider Electric',
    description: sampleDescription,
    minOrderLabel: 'Pedido mínimo: 3 unidades',
    price: {
      kind: 'fixed',
      amount: 450,
      previousAmount: 500,
      currency: 'PEN',
      unitLabel: 'Por unidad',
      includesTax: true,
    },
    seller: verifiedTacnaSeller,
  },
  {
    id: 'schneider-masterpact-mtz2-1',
    brand: 'Schneider',
    name: 'Seccionador Masterpact MTZ 2 2500A tipo HA 4P fijo',
    description: sampleDescription,
    price: {
      kind: 'fixed',
      amount: 31500,
      previousAmount: 32500,
      currency: 'USD',
      unitLabel: 'Por mayor',
      includesTax: true,
    },
    seller: verifiedLimaSeller,
  },
  {
    id: 'schneider-w22-motor-1',
    brand: 'Schneider',
    name: 'Motor eléctrico trifásico W22 jaula de ardilla • baja tensión • 380 V / 50 Hz',
    description: sampleDescription,
    badge: 'Nuevo lanzamiento',
    minOrderLabel: 'Pedido mínimo: 3 unidades',
    price: {
      kind: 'fixed',
      amount: 345,
      previousAmount: 450,
      currency: 'PEN',
      unitLabel: 'Por mayor',
      includesTax: true,
    },
    seller: verifiedLimaSeller,
  },
  {
    id: 'schneider-sm6-qm-2',
    brand: 'Schneider',
    name: 'Celda c/seccionador fusible SM6 QM 24kV, 630A serie B',
    description: sampleDescription,
    price: {
      kind: 'range',
      min: 20000,
      max: 21000,
      currency: 'PEN',
      unitLabel: 'Por mayor',
      includesTax: true,
    },
    seller: verifiedLimaSeller,
  },
  {
    id: 'schneider-dm1a-2',
    brand: 'Schneider',
    name: 'Celda c/interruptor DM1 A 24kV 630A 20kA serie B',
    description: sampleDescription,
    price: {
      kind: 'quote',
    },
    seller: verifiedLimaSeller,
  },
  {
    id: 'schneider-c60h-dc-2',
    brand: 'Schneider',
    name: 'Interruptor termomagnético - C60H-DC - 2X20A serie B',
    description: sampleDescription,
    price: {
      kind: 'fixed',
      amount: 50,
      currency: 'PEN',
      unitLabel: 'Por unidad',
      includesTax: true,
    },
    seller: verifiedTacnaSeller,
  },
  {
    id: 'schneider-llave-fuerza-2',
    brand: 'Schneider',
    name: 'Llave de fuerza de 175/250 Amp serie industrial',
    description: sampleDescription,
    price: {
      kind: 'fixed',
      amount: 450,
      previousAmount: 500,
      currency: 'PEN',
      unitLabel: 'Por unidad',
      includesTax: true,
    },
    seller: verifiedTacnaSeller,
  },
];
