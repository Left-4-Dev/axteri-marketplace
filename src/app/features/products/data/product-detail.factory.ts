import { catalog } from '../../../core/catalog/catalog.repository';
import type { CatalogProduct } from '../../../core/catalog/catalog.model';
import type { CommercialDetail, ProductDetail } from '../models/product-detail.model';
import { W22_PRODUCT_DETAIL } from './details/weg-w22-3kw.detail';
export function buildProductDetail(product: CatalogProduct): CommercialDetail | ProductDetail {
  if (product.id === W22_PRODUCT_DETAIL.id) return W22_PRODUCT_DETAIL;
  const variant = product.sku
    ? W22_PRODUCT_DETAIL.variants.find((item) => item.sku === product.sku)
    : undefined;
  return {
    ...catalog.toProductCard(product),
    sku: product.sku,
    category: catalog.getCategory(product.categoryId)!.name,
    purchase: variant ? { stock: variant.stock, deliveryEstimate: variant.deliveryEstimate } : {},
  };
}
