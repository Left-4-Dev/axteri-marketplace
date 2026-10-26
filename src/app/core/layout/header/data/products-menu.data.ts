export interface ProductMenuCategory {
  readonly id: string;
  readonly name: string;
  readonly subcategories: readonly string[];
}

export interface RecommendedBrand {
  readonly id: string;
  readonly name: string;
  readonly logoUrl: string;
}

// Only the initial mock has subcategory content. Empty collections avoid inventing a taxonomy.
export const PRODUCT_MENU_CATEGORIES: readonly ProductMenuCategory[] = [
  {
    id: 'automation',
    name: 'Automatización industrial y tecnología',
    subcategories: [
      'Fabricación aditiva e impresión 3D',
      'Equipos de corte y recorte industrial',
      'Equipos de conformado de materiales',
      'Maquinaria para procesamiento de plásticos',
      'Maquinaria para la industria textil',
      'Maquinaria para la industria electrónica',
      'Otras maquinarias industriales',
    ],
  },
  { id: 'laboratory', name: 'Equipos de laboratorio y metrología', subcategories: [] },
  { id: 'hydraulics', name: 'Equipos hidráulicos y neumáticos', subcategories: [] },
  {
    id: 'power-transmission',
    name: 'Equipos mecánicos y transmisión de potencia',
    subcategories: [],
  },
  { id: 'industrial-equipment', name: 'Maquinaria e equipos industriales', subcategories: [] },
  { id: 'machining', name: 'Máquinas, herramientas y mecanizado', subcategories: [] },
  { id: 'production', name: 'Máquinas y equipos de producción', subcategories: [] },
  { id: 'electrical-materials', name: 'Materiales eléctricos y electrónicos', subcategories: [] },
  { id: 'measurement', name: 'Sensores e instrumentos de medición', subcategories: [] },
];

export const RECOMMENDED_PRODUCT_BRANDS: readonly RecommendedBrand[] = [
  { id: 'siemens', name: 'Siemens', logoUrl: '/assets/brands/siemens.svg' },
  { id: 'abb', name: 'ABB', logoUrl: '/assets/brands/abb.svg' },
  { id: 'schneider', name: 'Schneider', logoUrl: '/assets/brands/schneider-electric.svg' },
  { id: 'omron', name: 'Omron', logoUrl: '/assets/brands/omron.svg' },
  { id: 'weg', name: 'WEG', logoUrl: '/assets/brands/weg.svg' },
  { id: 'rockwell', name: 'Rockwell', logoUrl: '/assets/brands/rockwell-automation.svg' },
  { id: '3m', name: '3M', logoUrl: '/assets/brands/3m.svg' },
];
