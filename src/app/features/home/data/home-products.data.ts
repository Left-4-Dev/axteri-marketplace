import { Product } from '../../../models/product.model';

// Precios y proveedores de demostración, no constituyen ofertas comerciales.
const seller = { name: 'LDF Projects', location: 'San Miguel, Lima', years: 20 } as const;
// Static design sample, not a live deadline or a renewable promotion.
const offer = {
  countdown: { kind: 'presentation', days: 2, hours: 5, minutes: 23, seconds: 45 },
} as const;
const offerPriceDetails = { unitLabel: 'Por unidad', includesTax: true } as const;

const atlas: Product = {
  id: 'atlas-ga15',
  brand: 'Atlas',
  name: 'Compresor tornillo rotativo 15 kW Copco GA15 FF',
  price: {
    kind: 'fixed',
    amount: 8500,
    previousAmount: 8700,
    currency: 'PEN',
    ...offerPriceDetails,
  },
  offer,
};
const siemens: Product = {
  id: 'siemens-simotics',
  brand: 'Siemens',
  name: 'Simotics SD 1LE1002-1BB22 motor eléctrico trifásico',
  price: {
    kind: 'fixed',
    amount: 1200,
    previousAmount: 1500,
    currency: 'PEN',
    ...offerPriceDetails,
  },
  offer,
};
const metabo: Product = {
  id: 'metabo-khe96',
  brand: 'Metabo',
  name: 'KHE 96 BVS martillo perforador industrial 1550 W',
  price: { kind: 'fixed', amount: 850, previousAmount: 900, currency: 'PEN', ...offerPriceDetails },
  offer,
};
const lincoln: Product = {
  id: 'lincoln-350mp',
  brand: 'Lincoln',
  name: 'Electric Power MIG 350MP soldadora MIG/TIG/STICK 350 A',
  price: {
    kind: 'fixed',
    amount: 3200,
    previousAmount: 3500,
    currency: 'PEN',
    ...offerPriceDetails,
  },
  offer,
};

export const LIMITED_OFFERS: readonly Product[] = [
  {
    id: 'grundfos-cm5',
    brand: 'Grundfos',
    name: 'Bomba centrífuga multietapa CM5-5 A-R-A-E-AVBE',
    price: {
      kind: 'fixed',
      amount: 1850,
      previousAmount: 1900,
      currency: 'PEN',
      ...offerPriceDetails,
    },
    offer,
  },
  atlas,
  siemens,
  metabo,
  lincoln,
];

export const FEATURED_PRODUCTS: readonly Product[] = [
  {
    id: 'mazak-200my',
    brand: 'Mazak',
    name: 'Quick Turn 200MY torno CNC 2 ejes + fresado',
    price: { kind: 'fixed', amount: 4500, currency: 'PEN' },
    seller,
  },
  {
    id: 'haas-vf2ss',
    brand: 'Haas',
    name: 'VF-2SS centro mecanizado vertical CNC',
    price: { kind: 'fixed', amount: 8500, previousAmount: 9500, currency: 'PEN' },
    seller,
  },
  {
    id: 'ingersoll-ss3l3',
    brand: 'Ingersoll',
    name: 'Rand SS3L3 compresor pistón 7.5 HP 230 L',
    price: { kind: 'range', min: 1200, max: 1250, currency: 'PEN' },
    seller,
  },
  {
    id: 'toyota-8fbet25',
    brand: 'Toyota',
    name: '8FBET25 montacargas eléctrico 2.5 ton',
    price: { kind: 'quote' },
    seller,
  },
  {
    id: 'cummins-c100d5',
    brand: 'Cummins',
    name: 'C100D5 generador diésel 100 kVA',
    price: { kind: 'fixed', amount: 3200, previousAmount: 3500, currency: 'PEN' },
    seller,
  },
];

export const RECOMMENDED_PRODUCTS: readonly Product[] = [
  {
    id: 'dorner-2200',
    brand: 'Dorner',
    name: '2200 Series 10M banda transportadora modular',
    price: { kind: 'fixed', amount: 4500, currency: 'PEN' },
    seller,
  },
  { ...atlas, seller },
  { ...siemens, seller, price: { kind: 'range', min: 1200, max: 1250, currency: 'PEN' } },
  { ...metabo, seller, price: { kind: 'quote' } },
  { ...lincoln, seller },
  {
    id: 'flex-mix-darmix',
    brand: 'Flex-Mix',
    name: 'Darmix+ mezcladora industrial 500 L',
    price: { kind: 'fixed', amount: 500, currency: 'PEN' },
    seller,
  },
  {
    id: 'despatch-lcc1',
    brand: 'Despatch',
    name: 'LCC1-34-2E horno convección industrial 300 °C',
    price: { kind: 'quote' },
    seller,
  },
  {
    id: 'miller-255',
    brand: 'Miller',
    name: 'Electric Multimatic 255 soldadora multiproceso 230 A',
    price: { kind: 'range', min: 3100, max: 3200, currency: 'PEN' },
    seller,
  },
  {
    id: 'okamoto-acc818',
    brand: 'Okamoto',
    name: 'ACC-818 NCII rectificadora de superficies CNC',
    price: { kind: 'fixed', amount: 45000, previousAmount: 46000, currency: 'PEN' },
    seller,
  },
  {
    id: 'kasto-hba320',
    brand: 'Kasto',
    name: 'HBA 320 A sierra de cinta automática 320 mm',
    price: { kind: 'quote' },
    seller,
  },
];
