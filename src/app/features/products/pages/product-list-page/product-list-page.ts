import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../models/product.model';
import { ProductCard, ProductCardVariant } from '../../../../shared/ui/product-card/product-card';
import {
  ProductFilters,
  cloneFiltersState,
} from '../../components/product-filters/product-filters';
import { DEFAULT_PRICE_RANGE, INITIAL_PRODUCT_FILTERS } from '../../data/product-filters.data';
import { PRODUCT_LISTING_ITEMS, PRODUCT_LISTING_SUMMARY } from '../../data/product-listing.data';
import {
  ProductFiltersState,
  ProductListingSummary,
  ProductViewMode,
} from '../../models/product-listing.model';

@Component({
  selector: 'app-product-list-page',
  imports: [RouterLink, ProductCard, ProductFilters],
  templateUrl: './product-list-page.html',
  styleUrl: './product-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class ProductListPage {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = input<readonly Product[]>(PRODUCT_LISTING_ITEMS);
  readonly summary = input<ProductListingSummary>(PRODUCT_LISTING_SUMMARY);

  protected readonly filtersComponent = viewChild(ProductFilters);

  protected readonly viewMode = signal<ProductViewMode>('grid');
  protected readonly appliedFilters = signal<ProductFiltersState>(
    cloneFiltersState(INITIAL_PRODUCT_FILTERS),
  );
  protected readonly isMobileFiltersOpen = signal<boolean>(false);

  constructor() {
    effect(() => {
      const body = this.document?.body;
      if (!body) {
        return;
      }
      body.style.overflow = this.isMobileFiltersOpen() ? 'hidden' : '';
    });

    this.destroyRef.onDestroy(() => {
      if (this.document?.body) {
        this.document.body.style.overflow = '';
      }
    });
  }

  protected readonly cardVariant = computed<ProductCardVariant>(() =>
    this.viewMode() === 'list' ? 'list' : 'default',
  );

  protected readonly appliedFilterCount = computed<number>(() => {
    const active = this.appliedFilters();
    const isPriceModified =
      active.priceRange.min > DEFAULT_PRICE_RANGE.min ||
      active.priceRange.max < DEFAULT_PRICE_RANGE.max;

    return (
      active.supplierVerification.length +
      (isPriceModified ? 1 : 0) +
      active.purchaseCapacity.length +
      (active.minRating !== null ? 1 : 0) +
      active.brands.length +
      active.origins.length
    );
  });

  protected readonly hasActiveCatalogFilters = computed<boolean>(() => {
    const active = this.appliedFilters();
    const isPriceModified =
      active.priceRange.min > DEFAULT_PRICE_RANGE.min ||
      active.priceRange.max < DEFAULT_PRICE_RANGE.max;

    return (
      active.supplierVerification.length > 0 ||
      isPriceModified ||
      active.purchaseCapacity.length > 0 ||
      active.brands.length > 0
    );
  });

  protected readonly filteredProducts = computed<readonly Product[]>(() => {
    const active = this.appliedFilters();
    const isPriceModified =
      active.priceRange.min > DEFAULT_PRICE_RANGE.min ||
      active.priceRange.max < DEFAULT_PRICE_RANGE.max;

    const matching = this.products().filter((product) => {
      if (active.supplierVerification.length === 1) {
        const isVerified = Boolean(product.seller?.verified);
        const wantsVerified = active.supplierVerification[0] === 'verified';
        if (isVerified !== wantsVerified) {
          return false;
        }
      }

      if (isPriceModified) {
        if (product.price.kind === 'quote') {
          return false;
        }
        if (product.price.kind === 'fixed') {
          if (
            product.price.amount < active.priceRange.min ||
            product.price.amount > active.priceRange.max
          ) {
            return false;
          }
        } else if (
          product.price.min > active.priceRange.max ||
          product.price.max < active.priceRange.min
        ) {
          return false;
        }
      }

      if (active.purchaseCapacity.length > 0) {
        const unitLabel = product.price.kind !== 'quote' ? product.price.unitLabel : undefined;
        if (!unitLabel || !active.purchaseCapacity.some((cap) => cap === unitLabel)) {
          return false;
        }
      }

      if (active.brands.length > 0) {
        const matchesBrand = active.brands.some(
          (brand) => brand.toLowerCase() === product.brand.toLowerCase(),
        );
        if (!matchesBrand) {
          return false;
        }
      }

      return true;
    });

    return this.sortProducts(matching, active.sortBy);
  });

  protected readonly displayedTotalResults = computed<number>(() =>
    this.hasActiveCatalogFilters() ? this.filteredProducts().length : this.summary().totalResults,
  );

  protected setViewMode(mode: ProductViewMode): void {
    this.viewMode.set(mode);
  }

  protected onFiltersChange(nextFilters: ProductFiltersState): void {
    this.appliedFilters.set(cloneFiltersState(nextFilters));
    this.isMobileFiltersOpen.set(false);
  }

  protected toggleMobileFilters(): void {
    if (this.isMobileFiltersOpen()) {
      this.closeMobileFilters();
      return;
    }
    this.isMobileFiltersOpen.set(true);
  }

  protected closeMobileFilters(): void {
    this.filtersComponent()?.discardDraft();
    this.isMobileFiltersOpen.set(false);
  }

  protected onEscapeKey(): void {
    if (this.isMobileFiltersOpen()) {
      this.closeMobileFilters();
    }
  }

  protected onRequestQuote(): void {
    // Handler local reservado para la futura integración de cotización.
  }

  protected onViewDetails(): void {
    // Handler local reservado para la futura navegación/contacto de proveedor.
  }

  private sortProducts(
    items: readonly Product[],
    sortBy: ProductFiltersState['sortBy'],
  ): readonly Product[] {
    if (sortBy === 'relevance') {
      return items;
    }

    const sorted = [...items];
    if (sortBy === 'newest') {
      return sorted.sort((a, b) => {
        const aNew = a.badge === 'Nuevo lanzamiento' ? 1 : 0;
        const bNew = b.badge === 'Nuevo lanzamiento' ? 1 : 0;
        return bNew - aNew;
      });
    }

    return sorted.sort((a, b) => {
      const aPrice = this.getComparablePrice(a, sortBy);
      const bPrice = this.getComparablePrice(b, sortBy);
      if (aPrice === null && bPrice === null) {
        return 0;
      }
      if (aPrice === null) {
        return 1;
      }
      if (bPrice === null) {
        return -1;
      }
      return sortBy === 'price-asc' ? aPrice - bPrice : bPrice - aPrice;
    });
  }

  private getComparablePrice(product: Product, sortBy: 'price-asc' | 'price-desc'): number | null {
    if (product.price.kind === 'quote') {
      return null;
    }
    if (product.price.kind === 'fixed') {
      return product.price.amount;
    }
    return sortBy === 'price-asc' ? product.price.min : product.price.max;
  }
}
