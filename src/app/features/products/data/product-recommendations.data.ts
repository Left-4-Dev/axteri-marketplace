import { Product } from '../../../models/product.model';
import { PRODUCT_LISTING_ITEMS } from './product-listing.data';

// Misma muestra comercial que el listado; conserva los objetos originales.
// Estas referencias aún no cuentan con fichas de detalle propias.
export const PRODUCT_DETAIL_RECOMMENDATIONS: readonly Product[] = PRODUCT_LISTING_ITEMS.slice(0, 6);
