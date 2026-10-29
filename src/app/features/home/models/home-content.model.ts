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

export interface NewsItem {
  readonly id: string;
  readonly alt: string;
  readonly badge?: string;
  // Optional while the complete artwork is pending from the design team.
  // Artwork excludes badge, CTA and dots, and reserves their shared UI safe areas.
  readonly imageUrl?: string;
  readonly mobileImageUrl?: string;
  readonly cta?: {
    readonly label: string;
    // A real application destination, supplied only when that navigation is available.
    readonly destination: string;
  };
}
