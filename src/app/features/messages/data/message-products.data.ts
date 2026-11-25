import { Product } from '../../../models/product.model';
import { PRODUCT_LISTING_ITEMS } from '../../products/data/product-listing.data';
import { LIMITED_OFFERS } from '../../home/data/home-products.data';
import { ConversationProduct } from '../models/messages.model';
import { formatCurrencyEsPe } from '../utils/messages-format';

// Assortments for the mock conversations, keyed by stable catalog IDs.
const catalog = new Map(
  [...PRODUCT_LISTING_ITEMS, ...LIMITED_OFFERS].map((product) => [product.id, product]),
);
const assortments: Readonly<Record<string, readonly string[]>> = {
  'ldf-projects': [
    'schneider-c60h-dc-1',
    'weg-w22-3kw',
    'schneider-sm6-qm-1',
    'schneider-dm1a-1',
    'schneider-llave-fuerza-1',
    'schneider-masterpact-mtz2-1',
  ],
  'electro-sur-industrial': ['schneider-sm6-qm-1', 'schneider-dm1a-1'],
  'automatizacion-andina': ['weg-w22-3kw'],
  'suministros-mineros-pacifico': ['metabo-khe96'],
  'tableros-control-peru': ['schneider-llave-fuerza-1', 'schneider-masterpact-mtz2-1'],
};

function toConversationProduct(product: Product): ConversationProduct {
  const { id, name, price } = product;
  const motor = id === 'weg-w22-3kw';
  let priceLabel: string | undefined;
  if (price.kind === 'fixed') priceLabel = formatCurrencyEsPe(price.amount, price.currency);
  if (price.kind === 'range')
    priceLabel =
      formatCurrencyEsPe(price.min, price.currency) +
      ' – ' +
      formatCurrencyEsPe(price.max, price.currency);
  return {
    id,
    name,
    brand: motor ? 'WEG' : product.brand,
    imageUrl: motor ? '/assets/products/weg-w22/gallery/weg-w22-01.webp' : product.imageUrl,
    priceLabel,
  };
}

export function mockSellerProducts(sellerId: string): readonly ConversationProduct[] {
  return (assortments[sellerId] ?? []).flatMap((id) => {
    const product = catalog.get(id);
    return product ? [toConversationProduct(product)] : [];
  });
}
