import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import {
  DEFAULT_PRICE_RANGE,
  INITIAL_PRODUCT_FILTERS,
  PRODUCT_BRANDS,
  PRODUCT_ORIGINS,
  PURCHASE_CAPACITY_OPTIONS,
  RATING_OPTIONS,
  SORT_OPTIONS,
  SUPPLIER_VERIFICATION_OPTIONS,
} from '../../data/product-filters.data';
import {
  ProductFilterOption,
  ProductFiltersState,
  ProductPriceRangeFilter,
  ProductSort,
  PurchaseCapacityFilter,
  SupplierVerificationFilter,
} from '../../models/product-listing.model';

export interface ActiveFilterChip {
  readonly id: string;
  readonly label: string;
  readonly remove: () => void;
}

export function cloneFiltersState(state: ProductFiltersState): ProductFiltersState {
  return {
    sortBy: state.sortBy,
    supplierVerification: [...state.supplierVerification],
    priceRange: {
      min: state.priceRange.min,
      max: state.priceRange.max,
    },
    purchaseCapacity: [...state.purchaseCapacity],
    minRating: state.minRating,
    brands: [...state.brands],
    origins: [...state.origins],
  };
}

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFilters {
  readonly appliedFilters = input<ProductFiltersState>(INITIAL_PRODUCT_FILTERS);
  readonly brands = input<readonly string[]>(PRODUCT_BRANDS);
  readonly origins = input<readonly string[]>(PRODUCT_ORIGINS);
  readonly priceBounds = input<ProductPriceRangeFilter>(DEFAULT_PRICE_RANGE);

  readonly filtersChange = output<ProductFiltersState>();

  protected readonly sortOptions: readonly ProductFilterOption<ProductSort>[] = SORT_OPTIONS;
  protected readonly verificationOptions: readonly ProductFilterOption<SupplierVerificationFilter>[] =
    SUPPLIER_VERIFICATION_OPTIONS;
  protected readonly capacityOptions: readonly ProductFilterOption<PurchaseCapacityFilter>[] =
    PURCHASE_CAPACITY_OPTIONS;
  protected readonly ratingOptions: readonly number[] = RATING_OPTIONS;

  protected readonly committedFilters = signal<ProductFiltersState>(
    cloneFiltersState(INITIAL_PRODUCT_FILTERS),
  );
  protected readonly draftFilters = signal<ProductFiltersState>(
    cloneFiltersState(INITIAL_PRODUCT_FILTERS),
  );
  protected readonly brandQuery = signal<string>('');
  protected readonly originQuery = signal<string>('');

  constructor() {
    effect(() => {
      const incoming = cloneFiltersState(this.appliedFilters());
      this.committedFilters.set(incoming);
      this.draftFilters.set(cloneFiltersState(incoming));
    });
  }

  protected readonly minPercent = computed<string>(() => {
    const bounds = this.priceBounds();
    const span = Math.max(1, bounds.max - bounds.min);
    const pct = ((this.draftFilters().priceRange.min - bounds.min) / span) * 100;
    return `${Math.max(0, Math.min(100, pct))}%`;
  });

  protected readonly maxPercent = computed<string>(() => {
    const bounds = this.priceBounds();
    const span = Math.max(1, bounds.max - bounds.min);
    const pct = ((this.draftFilters().priceRange.max - bounds.min) / span) * 100;
    return `${Math.max(0, Math.min(100, pct))}%`;
  });

  protected readonly isMinHandleNearMax = computed<boolean>(() => {
    const bounds = this.priceBounds();
    const span = Math.max(1, bounds.max - bounds.min);
    return this.draftFilters().priceRange.min - bounds.min > span * 0.9;
  });

  protected readonly filteredBrands = computed<readonly string[]>(() => {
    const query = this.brandQuery().trim().toLowerCase();
    if (!query) {
      return this.brands();
    }
    return this.brands().filter((brand) => brand.toLowerCase().includes(query));
  });

  protected readonly filteredOrigins = computed<readonly string[]>(() => {
    const query = this.originQuery().trim().toLowerCase();
    if (!query) {
      return this.origins();
    }
    return this.origins().filter((origin) => origin.toLowerCase().includes(query));
  });

  protected readonly activeChips = computed<readonly ActiveFilterChip[]>(() => {
    const applied = this.committedFilters();
    const bounds = this.priceBounds();
    const chips: ActiveFilterChip[] = [];

    for (const value of applied.supplierVerification) {
      const option = this.verificationOptions.find((item) => item.value === value);
      if (option) {
        chips.push({
          id: `verification:${value}`,
          label: option.label,
          remove: () =>
            this.removeAppliedFilter((state) => ({
              ...state,
              supplierVerification: state.supplierVerification.filter((item) => item !== value),
            })),
        });
      }
    }

    if (applied.priceRange.min > bounds.min || applied.priceRange.max < bounds.max) {
      chips.push({
        id: 'price-range',
        label: `S/ ${this.formatPrice(applied.priceRange.min)} - S/ ${this.formatPrice(applied.priceRange.max)}`,
        remove: () =>
          this.removeAppliedFilter((state) => ({
            ...state,
            priceRange: { min: bounds.min, max: bounds.max },
          })),
      });
    }

    for (const capacity of applied.purchaseCapacity) {
      chips.push({
        id: `capacity:${capacity}`,
        label: capacity,
        remove: () =>
          this.removeAppliedFilter((state) => ({
            ...state,
            purchaseCapacity: state.purchaseCapacity.filter((item) => item !== capacity),
          })),
      });
    }

    if (applied.minRating !== null) {
      chips.push({
        id: 'rating',
        label: `${applied.minRating} ★ a más`,
        remove: () =>
          this.removeAppliedFilter((state) => ({
            ...state,
            minRating: null,
          })),
      });
    }

    for (const brand of applied.brands) {
      chips.push({
        id: `brand:${brand}`,
        label: brand,
        remove: () =>
          this.removeAppliedFilter((state) => ({
            ...state,
            brands: state.brands.filter((item) => item !== brand),
          })),
      });
    }

    for (const origin of applied.origins) {
      chips.push({
        id: `origin:${origin}`,
        label: origin,
        remove: () =>
          this.removeAppliedFilter((state) => ({
            ...state,
            origins: state.origins.filter((item) => item !== origin),
          })),
      });
    }

    return chips;
  });

  applyFilters(): void {
    const next = cloneFiltersState(this.draftFilters());
    this.committedFilters.set(next);
    this.filtersChange.emit(cloneFiltersState(next));
  }

  discardDraft(): void {
    this.draftFilters.set(cloneFiltersState(this.committedFilters()));
    this.brandQuery.set('');
    this.originQuery.set('');
  }

  clearDraftFilters(): void {
    const bounds = this.priceBounds();
    this.draftFilters.set({
      sortBy: 'relevance',
      supplierVerification: [],
      priceRange: { min: bounds.min, max: bounds.max },
      purchaseCapacity: [],
      minRating: null,
      brands: [],
      origins: [],
    });
  }

  protected setSortBy(sortBy: ProductSort): void {
    this.draftFilters.update((current) => ({
      ...cloneFiltersState(current),
      sortBy,
    }));
  }

  protected toggleSupplierVerification(value: SupplierVerificationFilter): void {
    this.draftFilters.update((current) => ({
      ...cloneFiltersState(current),
      supplierVerification: this.toggleItem(current.supplierVerification, value),
    }));
  }

  protected onMinPriceInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const raw = Number(inputEl.value);
    const bounds = this.priceBounds();
    const currentMax = this.draftFilters().priceRange.max;
    const nextMin = Math.max(
      bounds.min,
      Math.min(Number.isFinite(raw) ? raw : bounds.min, currentMax),
    );
    inputEl.value = String(nextMin);
    this.draftFilters.update((current) => ({
      ...cloneFiltersState(current),
      priceRange: { min: nextMin, max: currentMax },
    }));
  }

  protected onMaxPriceInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const raw = Number(inputEl.value);
    const bounds = this.priceBounds();
    const currentMin = this.draftFilters().priceRange.min;
    const nextMax = Math.min(
      bounds.max,
      Math.max(Number.isFinite(raw) ? raw : bounds.max, currentMin),
    );
    inputEl.value = String(nextMax);
    this.draftFilters.update((current) => ({
      ...cloneFiltersState(current),
      priceRange: { min: currentMin, max: nextMax },
    }));
  }

  protected togglePurchaseCapacity(value: PurchaseCapacityFilter): void {
    this.draftFilters.update((current) => ({
      ...cloneFiltersState(current),
      purchaseCapacity: this.toggleItem(current.purchaseCapacity, value),
    }));
  }

  protected toggleRating(rating: number): void {
    this.draftFilters.update((current) => ({
      ...cloneFiltersState(current),
      minRating: current.minRating === rating ? null : rating,
    }));
  }

  protected onBrandQueryInput(event: Event): void {
    this.brandQuery.set((event.target as HTMLInputElement).value);
  }

  protected toggleBrand(brand: string): void {
    this.draftFilters.update((current) => ({
      ...cloneFiltersState(current),
      brands: this.toggleItem(current.brands, brand),
    }));
  }

  protected onOriginQueryInput(event: Event): void {
    this.originQuery.set((event.target as HTMLInputElement).value);
  }

  protected toggleOrigin(origin: string): void {
    this.draftFilters.update((current) => ({
      ...cloneFiltersState(current),
      origins: this.toggleItem(current.origins, origin),
    }));
  }

  protected formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private removeAppliedFilter(
    updater: (current: ProductFiltersState) => ProductFiltersState,
  ): void {
    const updatedApplied = cloneFiltersState(updater(cloneFiltersState(this.committedFilters())));
    const updatedDraft = cloneFiltersState(updater(cloneFiltersState(this.draftFilters())));
    this.committedFilters.set(updatedApplied);
    this.draftFilters.set(updatedDraft);
    this.filtersChange.emit(cloneFiltersState(updatedApplied));
  }

  private toggleItem<T>(list: readonly T[], value: T): readonly T[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }
}
