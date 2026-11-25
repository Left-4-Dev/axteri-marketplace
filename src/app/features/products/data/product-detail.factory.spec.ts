import { catalog } from '../../../core/catalog/catalog.repository';
import { buildProductDetail } from './product-detail.factory';
import { W22_PRODUCT_DETAIL } from './details/weg-w22-3kw.detail';
import {
  LIMITED_OFFERS,
  FEATURED_PRODUCTS,
  RECOMMENDED_PRODUCTS,
} from '../../home/data/home-products.data';
import { SELLER_PROFILES } from '../../sellers/data/seller-profile.data';
import { mockSellerProducts } from '../../messages/data/message-products.data';
import { PRODUCT_LISTING_ITEMS } from './product-listing.data';

describe('Commercial catalog presentation adapters', () => {
  it('resolves every card to a matching detail and price', () => {
    for (const card of [
      ...PRODUCT_LISTING_ITEMS,
      ...LIMITED_OFFERS,
      ...FEATURED_PRODUCTS,
      ...RECOMMENDED_PRODUCTS,
      ...W22_PRODUCT_DETAIL.accessories,
    ]) {
      const detail = buildProductDetail(catalog.getProduct(card.id)!);
      expect([detail.id, detail.name, detail.brand, detail.price, detail.seller?.name]).toEqual([
        card.id,
        card.name,
        card.brand,
        card.price,
        card.seller?.name,
      ]);
    }
    for (const variant of W22_PRODUCT_DETAIL.variants) {
      const product = catalog.products().find((p) => p.sku === variant.sku);
      expect(product).toBeDefined();
      expect(product?.price).toEqual(variant.price);
    }
    expect(W22_PRODUCT_DETAIL.documents).toHaveLength(5);
    expect(W22_PRODUCT_DETAIL.documents.every((doc) => doc.previewImage && !doc.href)).toBe(true);
  });
  it('resolves each seller profile and limits the message selector to its own products', () => {
    for (const seller of catalog.sellers) {
      const profile = SELLER_PROFILES.find((s) => s.id === seller.id)!;
      expect([profile.name, profile.years, profile.verified]).toEqual([
        seller.name,
        seller.years,
        seller.verified,
      ]);
      expect(mockSellerProducts(seller.id).map((p) => p.id)).toEqual(
        catalog.productsBySeller(seller.id).map((p) => p.id),
      );
      if (seller.id !== 'ldf-projects') {
        expect(profile.certifications).toEqual([]);
        expect(profile.gallery).toEqual([]);
      }
    }
  });
});
