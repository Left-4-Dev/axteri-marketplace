export interface SellerBrand {
  readonly id: string;
  readonly name: string;
  readonly logo?: string;
}

export interface SellerCertification {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
}

export interface SellerInformation {
  readonly supplierType: string;
  readonly taxId?: string;
  /** ISO YYYY-MM-DD when supplied by the seller. */
  readonly foundedOn?: string;
  readonly employeeCount?: number;
  readonly businessHours: readonly string[];
}

export interface SellerLocation {
  readonly country: string;
  readonly city: string;
  readonly district: string;
  readonly address?: string;
  readonly coordinates?: { readonly latitude: number; readonly longitude: number };
}

export interface SellerProfile {
  readonly id: string;
  readonly name: string;
  readonly years: number;
  readonly verified: boolean;
  readonly logo: string;
  readonly coverImage?: string;
  readonly sector: string;
  readonly productCount: number;
  readonly tags: readonly string[];
  readonly description: readonly string[];
  readonly brands: readonly SellerBrand[];
  readonly certifications: readonly SellerCertification[];
  readonly gallery: readonly string[];
  readonly information: SellerInformation;
  readonly location: SellerLocation;
}
