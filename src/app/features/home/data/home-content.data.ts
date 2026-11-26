import { catalog } from '../../../core/catalog/catalog.repository';
import { Brand, Category, NewsItem } from '../models/home-content.model';

export const HOME_CATEGORIES: readonly Category[] = catalog.collections.homeCategories.map((id) =>
  catalog.getCategory(id)!,
);

export const HOME_BRANDS: readonly Brand[] = [
  {
    ...catalog.getBrand('siemens')!,
    categories: ['Controladores', 'Pantallas HMI', 'Celdas eléctricas'],
    previews: [{ id: 'siemens-1' }, { id: 'siemens-2' }, { id: 'siemens-3' }, { id: 'siemens-4' }],
  },
  {
    ...catalog.getBrand('abb')!,
    categories: ['Brazos robóticos', 'Caudalímetros', 'Cortadoras CNC'],
    previews: [{ id: 'abb-1' }, { id: 'abb-2' }, { id: 'abb-3' }, { id: 'abb-4' }],
  },
  {
    ...catalog.getBrand('omron')!,
    categories: ['Servomotores', 'Sensores fotoeléctricos', 'Cámaras industriales'],
    previews: [{ id: 'omron-1' }, { id: 'omron-2' }, { id: 'omron-3' }, { id: 'omron-4' }],
  },
];

export const HOME_NEWS: readonly NewsItem[] = [
  { id: 'haas-vf3', alt: 'Promoción de lanzamiento Haas VF-3', badge: 'Nuevo lanzamiento' },
];
