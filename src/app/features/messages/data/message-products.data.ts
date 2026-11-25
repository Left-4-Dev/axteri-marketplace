import { catalog } from '../../../core/catalog/catalog.repository';
import { Product } from '../../../models/product.model';
import { ConversationProduct } from '../models/messages.model';
import { formatCurrencyEsPe } from '../utils/messages-format';

function toConversationProduct(product: Product): ConversationProduct {
  const { id, name, price } = product;
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
    brand: product.brand,
    imageUrl: product.imageUrl,
    priceLabel,
  };
}

export function mockSellerProducts(sellerId: string): readonly ConversationProduct[] {
  return catalog
    .productsBySeller(sellerId)
    .map((product) => toConversationProduct(catalog.toProductCard(product)));
}
