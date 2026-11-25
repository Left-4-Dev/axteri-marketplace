import { catalog } from '../../../core/catalog/catalog.repository';
import { Product } from '../../../models/product.model';
import { ProductListingSummary } from '../models/product-listing.model';

export const PRODUCT_LISTING_SUMMARY: ProductListingSummary = {
  categoryTitle: 'Automatización industrial y tecnología',
  totalResults: catalog.products().length,
  breadcrumbs: [{ label: 'Inicio', routerLink: '/' }, { label: 'Productos' }],
};

export const PRODUCT_LISTING_ITEMS: readonly Product[] = catalog.listingCards();
