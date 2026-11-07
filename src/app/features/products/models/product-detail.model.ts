import { Product } from '../../../models/product.model';

export interface ProductImage {
  readonly src: string;
  readonly alt: string;
}

export interface ProductHighlight {
  readonly label: string;
  readonly value: string;
}

export interface ProductDetail extends Product {
  readonly sku: string;
  readonly category: string;
  readonly images: readonly [ProductImage, ...ProductImage[]];
  readonly highlights: readonly ProductHighlight[];
  readonly applications: readonly string[];
  readonly warranty: string;
  readonly origin: string;
  readonly purchase: {
    readonly stock: number;
    readonly destination: string;
    readonly deliveryEstimate: string;
  };
}

export interface ProductPurchaseIntent {
  readonly kind: 'contact' | 'quote';
  readonly quantity: number;
}
