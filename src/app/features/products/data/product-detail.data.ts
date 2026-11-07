import { ProductDetail } from '../models/product-detail.model';

// Mock de presentación: disponibilidad y plazos no representan inventario real.
export const W22_PRODUCT_DETAIL: ProductDetail = {
  id: 'weg-w22-3kw',
  name: 'Motor eléctrico trifásico W22 jaula de ardilla, baja tensión — 380 V / 50 Hz — IP55 — Clase F — IEC 60034-30-1',
  brand: 'WEG',
  category: 'Motores eléctricos industriales',
  sku: 'W22-3KW-380-B3-IP55',
  badge: 'Nuevo lanzamiento',
  imageUrl: '/assets/images/products/motor-side.svg',
  description:
    'Motor eléctrico trifásico W22 de alta eficiencia para operación continua. Su construcción robusta permite integrarlo en equipos industriales de uso general.',
  price: {
    kind: 'fixed',
    amount: 4000,
    currency: 'PEN',
    unitLabel: 'Por unidad',
    includesTax: true,
  },
  seller: { name: 'LDF Projects', location: 'San Miguel, Lima', years: 20, verified: true },
  images: [
    {
      src: '/assets/images/products/motor-side.svg',
      alt: 'Ilustración provisional del motor W22, vista lateral',
    },
    {
      src: '/assets/images/products/motor-front.svg',
      alt: 'Ilustración provisional del motor W22, vista del eje',
    },
    {
      src: '/assets/images/products/motor-rear.svg',
      alt: 'Ilustración provisional del motor W22, vista del ventilador',
    },
  ],
  warranty: '24 meses',
  origin: 'Brasil',
  highlights: [
    { label: 'Potencia', value: '3 kW' },
    { label: 'Tensión nominal', value: '380 V' },
    { label: 'Velocidad', value: '940 rpm' },
    { label: 'Torque nominal', value: '30.5 N·m' },
    { label: 'Rendimiento', value: '86 %' },
    { label: 'Protección', value: 'IP55' },
  ],
  applications: ['Compresores', 'Bombas de proceso', 'Extrusoras', 'Máquinas herramienta'],
  purchase: {
    stock: 100,
    destination: 'Pueblo Libre, Lima',
    deliveryEstimate: '08–10 días hábiles',
  },
};

export const PRODUCT_DETAILS: readonly ProductDetail[] = [W22_PRODUCT_DETAIL];
