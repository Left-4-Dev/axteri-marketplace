import type { CatalogCategory } from '../catalog.model';
export const CATEGORIES: readonly CatalogCategory[] = [
  {
    id: 'automation',
    name: 'Automatización industrial y tecnología',
    subcategories: [
      {
        id: 'fabricacion-aditiva-e-impresion-3d',
        name: 'Fabricación aditiva e impresión 3D',
      },
      {
        id: 'equipos-de-corte-y-recorte-industrial',
        name: 'Equipos de corte y recorte industrial',
      },
      {
        id: 'equipos-de-conformado-de-materiales',
        name: 'Equipos de conformado de materiales',
      },
      {
        id: 'maquinaria-para-procesamiento-de-plasticos',
        name: 'Maquinaria para procesamiento de plásticos',
      },
      {
        id: 'maquinaria-para-la-industria-textil',
        name: 'Maquinaria para la industria textil',
      },
      {
        id: 'maquinaria-para-la-industria-electronica',
        name: 'Maquinaria para la industria electrónica',
      },
      {
        id: 'otras-maquinarias-industriales',
        name: 'Otras maquinarias industriales',
      },
    ],
  },
  {
    id: 'laboratory',
    name: 'Equipos de laboratorio y metrología',
    subcategories: [],
  },
  {
    id: 'hydraulics',
    name: 'Equipos hidráulicos y neumáticos',
    subcategories: [],
  },
  {
    id: 'power-transmission',
    name: 'Equipos mecánicos y transmisión de potencia',
    subcategories: [],
  },
  {
    id: 'industrial-equipment',
    name: 'Maquinaria y equipos industriales',
    subcategories: [],
  },
  {
    id: 'machining',
    name: 'Máquinas, herramientas y mecanizado',
    subcategories: [],
  },
  {
    id: 'production',
    name: 'Máquinas y equipos de producción',
    subcategories: [],
  },
  {
    id: 'electrical-materials',
    name: 'Materiales eléctricos y electrónicos',
    subcategories: [],
  },
  {
    id: 'measurement',
    name: 'Sensores e instrumentos de medición',
    subcategories: [],
  },
];
