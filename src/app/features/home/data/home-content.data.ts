import { Brand, Category, NewsPromotion } from '../models/home-content.model';

// Contenido de demostración basado en la referencia; los assets originales están pendientes.
export const HOME_CATEGORIES: readonly Category[] = [
  { id: 'automation', name: 'Automatización industrial y tecnología' },
  { id: 'power-transmission', name: 'Equipos mecánicos y transmisión de potencia' },
  { id: 'production', name: 'Máquinas y equipos de producción' },
  { id: 'laboratory', name: 'Equipos de laboratorio y metrología' },
  { id: 'industrial-equipment', name: 'Maquinaria y equipos industriales' },
  { id: 'electrical-materials', name: 'Materiales eléctricos y electrónicos' },
  { id: 'hydraulics', name: 'Equipos hidráulicos y neumáticos' },
  { id: 'machining', name: 'Máquinas, herramientas y mecanizado' },
  { id: 'measurement', name: 'Sensores e instrumentos de medición' },
];

export const HOME_BRANDS: readonly Brand[] = [
  {
    id: 'siemens',
    name: 'Siemens',
    categories: ['Controladores', 'Pantallas HMI', 'Celdas eléctricas'],
    previews: [{ id: 'siemens-1' }, { id: 'siemens-2' }, { id: 'siemens-3' }, { id: 'siemens-4' }],
  },
  {
    id: 'abb',
    name: 'ABB',
    categories: ['Brazos robóticos', 'Caudalímetros', 'Cortadoras CNC'],
    previews: [{ id: 'abb-1' }, { id: 'abb-2' }, { id: 'abb-3' }, { id: 'abb-4' }],
  },
  {
    id: 'omron',
    name: 'Omron',
    categories: ['Servomotores', 'Sensores fotoeléctricos', 'Cámaras industriales'],
    previews: [{ id: 'omron-1' }, { id: 'omron-2' }, { id: 'omron-3' }, { id: 'omron-4' }],
  },
];

export const HOME_NEWS: NewsPromotion = {
  label: 'Nuevo lanzamiento',
  title: 'HAAS VF-3',
  description: 'Centro mecanizado vertical CNC',
  priceLabel: 'USD 87,995',
  specifications: [
    { label: 'Cono', value: '40' },
    { label: 'Ejes', value: '3' },
    { label: 'RPM', value: '8.1K' },
    { label: 'Capacidad de herramientas', value: '20' },
  ],
};
