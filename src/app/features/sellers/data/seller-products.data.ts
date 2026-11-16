import { Product } from '../../../models/product.model';
import { PRODUCT_LISTING_ITEMS } from '../../products/data/product-listing.data';

// Development relationship by catalog ID; retain the original product objects.
const ldfProductIds = new Set([
  'schneider-sm6-qm-1',
  'schneider-dm1a-1',
  'schneider-c60h-dc-1',
  'schneider-llave-fuerza-1',
  'schneider-masterpact-mtz2-1',
  'weg-w22-3kw',
  'schneider-sm6-qm-2',
  'schneider-dm1a-2',
  'schneider-c60h-dc-2',
  'schneider-llave-fuerza-2',
]);

export const SELLER_PRODUCTS: Readonly<Partial<Record<string, readonly Product[]>>> = {
  'ldf-projects': PRODUCT_LISTING_ITEMS.filter((product) => ldfProductIds.has(product.id)),
};
