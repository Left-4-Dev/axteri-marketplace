import type { Product, OfferCountdown } from '../../models/product.model';
export interface CatalogCategory {
  readonly id: string;
  readonly name: string;
  readonly subcategories: readonly { readonly id: string; readonly name: string }[];
}
export interface CatalogBrand {
  readonly id: string;
  readonly name: string;
  readonly logoUrl?: string;
}
export interface SellerSummary {
  readonly id: string;
  readonly name: string;
  readonly years: number;
  readonly verified: boolean;
  readonly logoUrl?: string;
  readonly productCount?: number;
  readonly sector: string;
  readonly supplierType: string;
  readonly tagline: string;
  readonly businessHours: readonly string[];
  readonly location: {
    readonly district?: string;
    readonly city: string;
    readonly country: string;
  };
}
export interface CatalogProduct extends Omit<Product, 'brand' | 'seller' | 'offer'> {
  readonly sellerId: string;
  readonly categoryId: string;
  readonly subcategoryId?: string;
  readonly brandId: string;
  readonly origin?: string;
  readonly rating?: number;
  readonly sku?: string;
}
export interface CatalogOffer {
  readonly productId: string;
  readonly countdown: OfferCountdown;
}
export interface CatalogQuery {
  readonly categoria?: string;
  readonly subcategoria?: string;
  readonly proveedor?: string;
  readonly marca?: string;
  readonly q?: string;
  readonly origin?: string;
  readonly minRating?: number;
}
