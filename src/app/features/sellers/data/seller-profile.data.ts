import { catalog } from '../../../core/catalog/catalog.repository';
import type { SellerSummary } from '../../../core/catalog/catalog.model';
import { SellerProfile } from '../models/seller-profile.model';

function sellerBrand(id: string) {
  const brand = catalog.getBrand(id)!;
  return { id, name: brand.name, logo: brand.logoUrl };
}
function baseProfile(s: SellerSummary): SellerProfile {
  const products = catalog.productsBySeller(s.id);
  return {
    id: s.id,
    name: s.name,
    sector: s.sector,
    verified: s.verified,
    years: s.years,
    logo: s.logoUrl,
    productCount: s.productCount ?? products.length,
    description: [s.tagline],
    location: s.location,
    tags: [],
    gallery: [],
    certifications: [],
    brands: [...new Set(products.map((p) => p.brandId))].map(sellerBrand),
    information: { supplierType: s.supplierType, businessHours: s.businessHours },
  };
}
const ldf = catalog.getSeller('ldf-projects')!;
// Development fixture only: counts, verification and commercial details are not API data.
// Keep name, years, productCount and location consistent with the existing product mock.
export const LDF_PROJECTS_SELLER: SellerProfile = {
  ...baseProfile(ldf),
  coverImage: '/assets/sellers/ldf-projects/cover.webp',
  tags: ['Celdas', 'Transformadores', 'EPP', 'Llaves eléctricas'],
  description: [
    'Perfil de desarrollo de LDF Projects, proveedor de soluciones eléctricas para la industria.',
    'Contenido de ejemplo para preparar la presentación de productos y servicios del proveedor.',
  ],
  brands: catalog.collections.ldfBrands.map(sellerBrand),
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
    supplierType: ldf.supplierType,
    taxId: '20516921529',
    foundedOn: '01 - 07 - 2014',
    employeeCount: 6,
    businessHours: ldf.businessHours,
  },
  location: {
    ...ldf.location,
    address: 'Chaquilchaca 270, Lima 15088',
    coordinates: { latitude: -12.0701228, longitude: -77.0969605 },
  },
};

export const SELLER_PROFILES: readonly SellerProfile[] = catalog.sellers.map((s) =>
  s.id === ldf.id ? LDF_PROJECTS_SELLER : baseProfile(s),
);
