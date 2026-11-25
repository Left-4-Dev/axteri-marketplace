export interface ProductPriceDetails {
  readonly unitLabel?: string;
  readonly includesTax?: boolean;
}

export type ProductPrice =
  | ({
      readonly kind: 'fixed';
      readonly amount: number;
      readonly previousAmount?: number;
      readonly currency: string;
    } & ProductPriceDetails)
  | ({
      readonly kind: 'range';
      readonly min: number;
      readonly max: number;
      readonly currency: string;
    } & ProductPriceDetails)
  | { readonly kind: 'quote' };

// Presentation only until the promotion service supplies an actual expiration.
export interface OfferCountdown {
  readonly kind: 'presentation';
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

export interface Product {
  readonly hasSpecifications?: boolean;
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly brandId?: string;
  readonly sellerId?: string;
  readonly categoryId?: string;
  readonly subcategoryId?: string;
  readonly origin?: string;
  readonly rating?: number;
  readonly description?: string;
  readonly badge?: string;
  readonly minOrderLabel?: string;
  readonly imageUrl?: string;
  readonly price: ProductPrice;
  readonly offer?: { readonly countdown: OfferCountdown };
  readonly seller?: {
    readonly name: string;
    readonly location: string;
    readonly years: number;
    readonly verified?: boolean;
  };
}
