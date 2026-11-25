import { Injectable, signal } from '@angular/core';
import { Product } from '../../models/product.model';
import { CatalogProduct, CatalogQuery, SellerSummary } from './catalog.model';
import { CATEGORIES } from './data/categories.data';
import { BRANDS } from './data/brands.data';
import { SELLERS } from './data/sellers.data';
import { CATALOG_PRODUCTS } from './data/products';
import { OFFERS } from './data/offers.data';
import { collections } from './data/collections.data';

export function sellerLocation(seller: SellerSummary): string {
  return [seller.location.district, seller.location.city].filter(Boolean).join(', ');
}
function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}
@Injectable({ providedIn: 'root', useFactory: () => catalog })
export class CatalogRepository {
  readonly products = signal<readonly CatalogProduct[]>(CATALOG_PRODUCTS).asReadonly();
  readonly sellers = SELLERS;
  readonly categories = CATEGORIES;
  readonly brands = BRANDS;
  readonly offers = OFFERS;
  readonly collections = collections;
  getProduct(id: string) {
    return this.products().find((p) => p.id === id);
  }
  getSeller(id: string) {
    return this.sellers.find((s) => s.id === id);
  }
  getCategory(id: string) {
    return this.categories.find((c) => c.id === id);
  }
  getBrand(id: string) {
    return this.brands.find((b) => b.id === id);
  }
  productsBySeller(id: string) {
    return this.listProducts({ proveedor: id });
  }
  listProducts(query: CatalogQuery = {}) {
    const term = normalize(query.q ?? '');
    return this.products().filter(
      (p) =>
        (!query.categoria || p.categoryId === query.categoria) &&
        (!query.subcategoria || p.subcategoryId === query.subcategoria) &&
        (!query.marca || p.brandId === query.marca) &&
        (!query.proveedor || p.sellerId === query.proveedor) &&
        (!query.origin || p.origin === query.origin) &&
        (query.minRating === undefined || (p.rating ?? -1) >= query.minRating) &&
        (!term ||
          normalize(
            [
              p.name,
              this.getBrand(p.brandId)?.name,
              this.getSeller(p.sellerId)?.name,
              this.getCategory(p.categoryId)?.name,
              this.getCategory(p.categoryId)?.subcategories.find((s) => s.id === p.subcategoryId)
                ?.name,
            ].join(' '),
          ).includes(term)),
    );
  }
  listingCards(): readonly Product[] {
    const lead = new Set<string>(this.collections.listingLead);
    return [
      ...this.cards(this.collections.listingLead),
      ...this.products()
        .filter((product) => !lead.has(product.id))
        .map((product) => this.toProductCard(product)),
    ];
  }
  toProductCard(product: CatalogProduct): Product {
    const seller = this.getSeller(product.sellerId)!;
    return {
      ...product,
      brand: this.getBrand(product.brandId)!.name,
      seller: {
        name: seller.name,
        years: seller.years,
        verified: seller.verified,
        location: sellerLocation(seller),
      },
    };
  }
  cards(ids: readonly string[]): readonly Product[] {
    return ids.map((id) => this.toProductCard(this.getProduct(id)!));
  }
}
// Static fixture adapters and Angular consumers share the same immutable catalog.
export const catalog = new CatalogRepository();
