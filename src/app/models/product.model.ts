export type ProductPrice =
  | {
      readonly kind: 'fixed';
      readonly amount: number;
      readonly previousAmount?: number;
      readonly currency: string;
    }
  | {
      readonly kind: 'range';
      readonly min: number;
      readonly max: number;
      readonly currency: string;
    }
  | { readonly kind: 'quote' };

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly imageUrl?: string;
  readonly price: ProductPrice;
  readonly seller?: {
    readonly name: string;
    readonly location: string;
    readonly years: number;
  };
}
