export type ProductViewMode = 'grid' | 'list';

export interface ProductBreadcrumbItem {
  readonly label: string;
  readonly routerLink?: string;
}

export interface ProductListingSummary {
  readonly categoryTitle: string;
  readonly totalResults: number;
  readonly breadcrumbs: readonly ProductBreadcrumbItem[];
}
