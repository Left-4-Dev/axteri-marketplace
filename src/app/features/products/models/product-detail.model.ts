import { Product } from '../../../models/product.model';

export interface ProductImage {
  readonly src: string;
  readonly alt: string;
}

export interface ProductHighlight {
  readonly label: string;
  readonly value: string;
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

export interface ProductDetail extends Product {
  readonly sku: string;
  readonly category: string;
  readonly images: readonly [ProductImage, ...ProductImage[]];
  readonly highlights: readonly ProductHighlight[];
  readonly applications: readonly string[];
  readonly warranty: string;
  readonly origin: string;
  readonly specifications: ProductSpecificationSheet;
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
