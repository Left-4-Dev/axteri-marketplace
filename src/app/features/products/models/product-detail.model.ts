import { Product, ProductPrice } from '../../../models/product.model';

export interface ProductImage {
  readonly src: string;
  readonly alt: string;
  readonly fallbackSrc?: string;
  readonly fallbackAlt?: string;
}

export interface ProductHighlight {
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly overview?: boolean;
}

export interface ProductSpecification {
  readonly label: string;
  readonly value: string;
  /** Aclaración secundaria opcional, por ejemplo una equivalencia de unidad. */
  readonly detail?: string;
}

export interface ProductSpecificationGroup {
  /** Identificador estable: la selección no depende del orden de los grupos. */
  readonly id: string;
  /** Nombre corto del grupo en el selector. */
  readonly label: string;
  /** Título completo del panel de especificaciones. */
  readonly title: string;
  readonly specifications: readonly ProductSpecification[];
}

export interface ProductSpecificationSheet {
  readonly groups: readonly ProductSpecificationGroup[];
  readonly verification?: { readonly date: string; readonly source: string };
}

export interface ProductDescriptionContent {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly highlightsTitle?: string;
  readonly highlights?: readonly string[];
}

export interface ProductDocument {
  readonly id: string;
  readonly title: string;
  readonly fileName: string;
  readonly format: string;
  readonly category?: string;
  /** URL of the real document. May be a local asset today or a remote URL later. */
  readonly href?: string;
  /** Image of the document's first page. Any resolvable URL; the view never assumes `/assets`. */
  readonly previewImage?: string;
}

export interface ProductVariantAttributes {
  readonly polesGroup: string;
  readonly poles: string;
  readonly power: string;
  readonly powerDetail?: string;
  readonly frame: string;
  readonly speed: string;
  readonly torque: string;
  readonly current: string;
  readonly efficiency: string;
  readonly powerFactor: string;
  readonly weight: string;
  readonly voltage: string;
  readonly mounting: string;
  readonly protection: string;
}

export interface ProductVariant {
  readonly id: string;
  readonly sku: string;
  readonly category: string;
  readonly attributes: ProductVariantAttributes;
  readonly price: ProductPrice;
  readonly stock: number;
  readonly deliveryEstimate: string;
  readonly image?: ProductImage;
}

export interface ProductRatingDistribution {
  readonly stars: number;
  readonly count: number;
}

export interface ProductReview {
  readonly id: string;
  readonly author: string;
  readonly location?: string;
  readonly rating: number;
  /** Fecha en formato ISO YYYY-MM-DD como única fuente de verdad. */
  readonly date: string;
  readonly title?: string;
  readonly comment: string;
  readonly verifiedPurchase?: boolean;
  readonly images?: readonly ProductImage[];
}

export interface ProductReviewsData {
  readonly average: number;
  readonly distribution: readonly ProductRatingDistribution[];
  readonly items: readonly ProductReview[];
}

export interface ProductDetailSeller extends NonNullable<Product['seller']> {
  readonly logo?: ProductImage;
  readonly productCount?: number;
}

export interface ProductDetail extends Product {
  readonly series?: string;
  readonly seller?: ProductDetailSeller;
  readonly galleryIcons?: { readonly favorite: string; readonly expand: string };
  readonly originFlag?: { readonly src: string; readonly fallback: string };
  readonly sku: string;
  readonly category: string;
  readonly images: readonly [ProductImage, ...ProductImage[]];
  readonly highlights: readonly ProductHighlight[];
  readonly applications: readonly string[];
  readonly warranty: string;
  readonly origin: string;
  readonly specifications: ProductSpecificationSheet;
  readonly detailedDescription: ProductDescriptionContent;
  readonly documents: readonly ProductDocument[];
  readonly accessories: readonly Product[];
  readonly variants: readonly ProductVariant[];
  readonly reviews: ProductReviewsData;
  readonly purchase: {
    readonly previousAmount?: number;
    readonly stock: number;
    readonly destination: string;
    readonly deliveryEstimate: string;
  };
}

export interface ProductPurchaseIntent {
  readonly kind: 'contact' | 'quote';
  readonly quantity: number;
}
