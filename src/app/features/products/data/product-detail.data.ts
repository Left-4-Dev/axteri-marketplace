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
  // Valores transcritos de la referencia de diseño como mock de presentación; no constituyen
  // una ficha técnica verificada. La verificación mostrada también es parte del mock.
  specifications: {
    groups: [
      {
        id: 'electrical',
        label: 'Eléctricas',
        title: 'Características eléctricas',
        specifications: [
          { label: 'Potencia nominal', value: '3 kW', detail: '4 HP' },
          { label: 'Corriente nominal', value: '9.2 A' },
          { label: 'Tensión nominal', value: '380-415 V Y' },
          { label: 'Frecuencia', value: '50 / 60 Hz' },
          { label: 'Velocidad nominal', value: '940 rpm' },
          { label: 'Factor de potencia (cos φ)', value: '0.87' },
          { label: 'Eficiencia 100% / 75% / 50%', value: '86.0 / 86.4 / 84.5 %' },
          { label: 'Clase de eficiencia (IEC)', value: 'IE3 Premium' },
          { label: 'Corriente de arranque', value: '73 A', detail: 'Iarr/In=7.9' },
          { label: 'Torque máximo (Tmax/Tn)', value: '3.4' },
          { label: 'Torque de arranque (Tarr/Tn)', value: '2.7' },
          { label: 'Apto para variador (VFD)', value: 'Sí, hasta 100 m cable' },
        ],
      },
      {
        id: 'mechanical',
        label: 'Mecánicas',
        title: 'Características mecánicas',
        specifications: [
          { label: 'Marco / Carcasa IEC', value: '100 L' },
          { label: 'Forma de montaje', value: 'B3 (patas)' },
          { label: 'Diámetro del eje', value: '28 mm' },
          { label: 'Largo del eje', value: '60 mm · chavetero DIN 6885' },
          { label: 'Material de carcasa', value: 'Hierro fundido FC-200' },
          { label: 'Rodamientos D.E. / N.D.E.', value: '6206 ZZ / 6206 ZZ' },
          { label: 'Lubricación', value: 'Prelubricado · 20,000 h' },
          { label: 'Peso aproximado', value: '26 kg' },
          { label: 'Momento de inercia (J)', value: '0.0078 kg · m²' },
        ],
      },
      {
        id: 'thermal',
        label: 'Térmicas',
        title: 'Características térmicas',
        specifications: [
          { label: 'Clase de aislamiento', value: 'F (155 °C)' },
          { label: 'Elevación de temperatura', value: 'B (80 K)' },
          { label: 'Temp. ambiente máx.', value: '40 °C' },
          { label: 'Altitud máxima s.n.m.', value: '1,000 m' },
          { label: 'Servicio (factor)', value: 'S1 · F.S. 1.15' },
          { label: 'Sistema de enfriamiento', value: 'IC411 (auto-ventilado)' },
        ],
      },
      {
        id: 'acoustic-vibration',
        label: 'Acústica y vibración',
        title: 'Características acústicas y de vibración',
        specifications: [
          { label: 'Nivel de ruido (Lp, 1 m)', value: '62 dB (A)' },
          { label: 'Grado de vibración', value: 'A · ISO 10816' },
          { label: 'Balanceo del rotor', value: 'Media chaveta' },
          { label: 'Equilibrio dinámico', value: 'Grado G6.3' },
        ],
      },
      {
        id: 'operating-environment',
        label: 'Entorno operativo',
        title: 'Entorno operativo',
        specifications: [
          { label: 'Grado de protección', value: 'IP55' },
          { label: 'Apto para exterior', value: 'Sí · con sombra' },
          { label: 'Resistencia a la humedad', value: '95% HR no condensante' },
          { label: 'Pintura', value: 'Alquídica RAL 5009' },
          { label: 'Atmósferas peligrosas (Ex)', value: 'No · ver serie W22Xd' },
        ],
      },
    ],
    verification: { date: '12 ene 2026', source: 'LDF Projects' },
  },
  purchase: {
    stock: 100,
    destination: 'Pueblo Libre, Lima',
    deliveryEstimate: '08–10 días hábiles',
  },
};

export const PRODUCT_DETAILS: readonly ProductDetail[] = [W22_PRODUCT_DETAIL];
