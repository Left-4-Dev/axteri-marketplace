export type ProductViewMode = 'grid' | 'list';

export type ProductSort = 'relevance' | 'newest' | 'price-asc' | 'price-desc';

export type SupplierVerificationFilter = 'verified' | 'unverified';

export type PurchaseCapacityFilter = 'Por unidad' | 'Por mayor';

export interface ProductPriceRangeFilter {
  readonly min: number;
  readonly max: number;
}

export interface ProductFiltersState {
  readonly sortBy: ProductSort;
  readonly supplierVerification: readonly SupplierVerificationFilter[];
  readonly priceRange: ProductPriceRangeFilter;
  readonly purchaseCapacity: readonly PurchaseCapacityFilter[];
  readonly minRating: number | null;
  readonly brands: readonly string[];
  readonly origins: readonly string[];
}

export interface ProductFilterOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
}

export interface ProductBreadcrumbItem {
  readonly label: string;
  readonly routerLink?: string;
}

export interface ProductListingSummary {
  readonly categoryTitle: string;
  readonly totalResults: number;
  readonly breadcrumbs: readonly ProductBreadcrumbItem[];
}
