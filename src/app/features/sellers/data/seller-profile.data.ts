import { SellerProfile } from '../models/seller-profile.model';

// Development fixture only: counts, verification and commercial details are not API data.
// Keep name, years, productCount and location consistent with the existing product mock.
export const LDF_PROJECTS_SELLER: SellerProfile = {
  id: 'ldf-projects',
  name: 'LDF Projects',
  logo: '/assets/sellers/ldf-projects/logo.webp',
  coverImage: '/assets/sellers/ldf-projects/cover.webp',
  sector: 'Eléctrico',
  verified: true,
  productCount: 200,
  years: 12,
  tags: ['Celdas', 'Transformadores', 'EPP', 'Llaves eléctricas'],
  description: [
    'Perfil de desarrollo de LDF Projects, proveedor de soluciones eléctricas para la industria.',
    'Contenido de ejemplo para preparar la presentación de productos y servicios del proveedor.',
  ],
  brands: [
    {
      id: 'schneider-electric',
      name: 'Schneider Electric',
      logo: '/assets/brands/schneider-electric.svg',
    },
    { id: 'honeywell', name: 'Honeywell', logo: '/assets/brands/honeywell.svg' },
    { id: 'indeco', name: 'Indeco', logo: '/assets/brands/indeco.svg' },
    { id: 'sarel', name: 'Sarel', logo: '/assets/brands/sarel.svg' },
    { id: 'siemens', name: 'Siemens', logo: '/assets/brands/siemens.svg' },
    { id: '3m', name: '3M', logo: '/assets/brands/3m.svg' },
  ],
  certifications: [{ id: 'development-example', name: 'Certificación de ejemplo (desarrollo)' }],
  // Gallery and certification images will be supplied when real assets are added.
  gallery: [],
  information: {
    supplierType: 'Distribuidor (ejemplo de desarrollo)',
    businessHours: [],
  },
  location: {
    country: 'Perú',
    city: 'Lima',
    district: 'San Miguel',
  },
};

export const SELLER_PROFILES: readonly SellerProfile[] = [LDF_PROJECTS_SELLER];
