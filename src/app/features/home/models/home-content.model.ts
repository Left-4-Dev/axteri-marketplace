export interface Category {
  readonly id: string;
  readonly name: string;
  readonly imageUrl?: string;
}

export interface Brand {
  readonly id: string;
  readonly name: string;
  readonly categories: readonly string[];
  readonly previews: readonly {
    readonly id: string;
    readonly imageUrl?: string;
  }[];
}

export interface NewsPromotion {
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly priceLabel: string;
  readonly imageUrl?: string;
  readonly specifications: readonly {
    readonly label: string;
    readonly value: string;
  }[];
}
