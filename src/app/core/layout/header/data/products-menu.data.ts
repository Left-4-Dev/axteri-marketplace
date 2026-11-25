import { catalog } from '../../../catalog/catalog.repository';
export interface HeaderNavigationLink {
  readonly id: string;
  readonly label: string;
  readonly routerLink?: string;
  readonly fragment?: string;
}

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

export const HEADER_NAVIGATION_LINKS: readonly HeaderNavigationLink[] = [
  { id: 'offers', label: 'Oferta', routerLink: '/', fragment: 'limited-offers' },
  { id: 'sell', label: 'Vender' },
  { id: 'help', label: 'Ayuda' },
];

export const PRODUCT_MENU_CATEGORIES: readonly ProductMenuCategory[] = catalog.categories.map(
  (c) => ({ ...c, subcategories: c.subcategories.map((s) => s.name) }),
);
export const RECOMMENDED_PRODUCT_BRANDS: readonly RecommendedBrand[] =
  catalog.collections.menuBrands.map((id) => {
    const b = catalog.getBrand(id)!;
    return { ...b, logoUrl: b.logoUrl! };
  });
