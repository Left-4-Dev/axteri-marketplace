import { catalog } from '../../../core/catalog/catalog.repository';
export const LIMITED_OFFERS = catalog.offers.map(({ productId, countdown }) => ({
  ...catalog.toProductCard(catalog.getProduct(productId)!),
  offer: { countdown },
}));
export const FEATURED_PRODUCTS = catalog.cards(catalog.collections.featured);
export const RECOMMENDED_PRODUCTS = catalog.cards(catalog.collections.recommended);
