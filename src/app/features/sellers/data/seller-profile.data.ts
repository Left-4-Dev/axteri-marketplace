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
  // Development examples matching the target; not verified certifications.
  certifications: [
    {
      id: 'iso-9001-2015',
      name: 'ISO 9001:2015',
      image: '/assets/sellers/ldf-projects/certifications/iso-9001-2015.webp',
    },
    {
      id: 'iso-45001-2018',
      name: 'ISO 45001:2018',
      image: '/assets/sellers/ldf-projects/certifications/iso-45001-2018.webp',
    },
    {
      id: 'iso-37001',
      name: 'ISO 37001',
      image: '/assets/sellers/ldf-projects/certifications/iso-37001.webp',
    },
    {
      id: 'scc-accredited',
      name: 'SCC Accredited',
      image: '/assets/sellers/ldf-projects/certifications/scc-accredited.webp',
    },
    {
      id: 'qfs-management',
      name: 'QFS Management',
      image: '/assets/sellers/ldf-projects/certifications/qfs-management.webp',
    },
  ],
  // Gallery and certification images will be supplied when real assets are added.
  gallery: [
    '/assets/sellers/ldf-projects/gallery/ldf-projects-01.webp',
    '/assets/sellers/ldf-projects/gallery/ldf-projects-02.webp',
    '/assets/sellers/ldf-projects/gallery/ldf-projects-03.webp',
    '/assets/sellers/ldf-projects/gallery/ldf-projects-04.webp',
  ],
  information: {
    supplierType: 'Importador',
    taxId: '20516921529',
    foundedOn: '01 - 07 - 2014',
    employeeCount: 6,
    businessHours: ['L - V de 9 am a 7 pm', 'S de 9 am a 1 pm'],
  },
  location: {
    country: 'Perú',
    city: 'Lima',
    district: 'San Miguel',
    address: 'Chaquilchaca 270, Lima 15088',
    coordinates: { latitude: -12.0701228, longitude: -77.0969605 },
  },
};

export const SELLER_PROFILES: readonly SellerProfile[] = [LDF_PROJECTS_SELLER];
