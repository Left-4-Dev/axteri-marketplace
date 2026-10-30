import {
  ProductFilterOption,
  ProductFiltersState,
  ProductPriceRangeFilter,
  ProductSort,
  PurchaseCapacityFilter,
  SupplierVerificationFilter,
} from '../models/product-listing.model';

export const DEFAULT_PRICE_RANGE: ProductPriceRangeFilter = {
  min: 0,
  max: 20000,
};

export const INITIAL_PRODUCT_FILTERS: ProductFiltersState = {
  sortBy: 'relevance',
  supplierVerification: [],
  priceRange: DEFAULT_PRICE_RANGE,
  purchaseCapacity: [],
  minRating: null,
  brands: [],
  origins: [],
};

export const SORT_OPTIONS: readonly ProductFilterOption<ProductSort>[] = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price-asc', label: 'De precios bajos a altos' },
  { value: 'price-desc', label: 'De precios altos a bajos' },
];

export const SUPPLIER_VERIFICATION_OPTIONS: readonly ProductFilterOption<SupplierVerificationFilter>[] =
  [
    { value: 'verified', label: 'Proveedor verificado' },
    { value: 'unverified', label: 'Proveedor no verificado' },
  ];

export const PURCHASE_CAPACITY_OPTIONS: readonly ProductFilterOption<PurchaseCapacityFilter>[] = [
  { value: 'Por unidad', label: 'Por unidad' },
  { value: 'Por mayor', label: 'Por mayor' },
];

export const RATING_OPTIONS: readonly number[] = [1, 2, 3, 4, 5];

export const PRODUCT_BRANDS: readonly string[] = [
  'Schneider',
  'Acid Eater',
  'Abus',
  'Action Chemical',
  '3B Putty',
  'Ability One',
  'Siemens',
  'Atlas',
  'Metabo',
  'Lincoln',
  'Grundfos',
  'Mazak',
  'Haas',
  'Ingersoll',
  'Toyota',
  'Cummins',
  'Dorner',
  'Flex-Mix',
  'Despatch',
  'Miller',
  'Okamoto',
  'Kasto',
];

export const PRODUCT_ORIGINS: readonly string[] = [
  'Alemania',
  'Estados Unidos',
  'China',
  'Japón',
  'Reino Unido',
  'España',
  'India',
];
