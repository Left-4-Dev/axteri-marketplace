import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { CatalogRepository } from '../../../../core/catalog/catalog.repository';
import { Product } from '../../../../models/product.model';
import { ProductCard, ProductCardVariant } from '../../../../shared/ui/product-card/product-card';
import {
  ActiveFilterChip,
  ProductFilters,
  cloneFiltersState,
} from '../../components/product-filters/product-filters';
import { ProductPagination } from '../../components/product-pagination/product-pagination';
import {
  DEFAULT_PRICE_RANGE,
  INITIAL_PRODUCT_FILTERS,
  PRODUCT_BRANDS,
  PRODUCT_ORIGINS,
} from '../../data/product-filters.data';
import { PRODUCT_LISTING_ITEMS, PRODUCT_LISTING_SUMMARY } from '../../data/product-listing.data';
import {
  ProductBreadcrumbItem,
  ProductFiltersState,
  ProductListingSummary,
  ProductSort,
  ProductViewMode,
  PurchaseCapacityFilter,
  SupplierVerificationFilter,
} from '../../models/product-listing.model';

export const PRODUCT_LIST_PAGE_SIZE = 40;

interface CatalogContextQuery {
  readonly q: string;
  readonly categoria: string;
  readonly subcategoria: string;
  readonly proveedor: string;
}

const EMPTY_CONTEXT_QUERY: CatalogContextQuery = {
  q: '',
  categoria: '',
  subcategoria: '',
  proveedor: '',
};

@Component({
  selector: 'app-product-list-page',
  imports: [RouterLink, ProductCard, ProductFilters, ProductPagination],
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogRepository);

  readonly products = input<readonly Product[]>(PRODUCT_LISTING_ITEMS);
  readonly summary = input<ProductListingSummary>(PRODUCT_LISTING_SUMMARY);

  protected readonly filtersComponent = viewChild(ProductFilters);
  protected readonly resultsHeader = viewChild<ElementRef<HTMLElement>>('resultsHeader');

  protected readonly pageSize = PRODUCT_LIST_PAGE_SIZE;
  protected readonly viewMode = signal<ProductViewMode>('grid');
  protected readonly currentPage = signal<number>(1);
  protected readonly contextQuery = signal<CatalogContextQuery>(EMPTY_CONTEXT_QUERY);
  protected readonly hasUnmatchedBrandParam = signal<boolean>(false);
  protected readonly hasUnmatchedOriginParam = signal<boolean>(false);
  protected readonly appliedFilters = signal<ProductFiltersState>(
    cloneFiltersState(INITIAL_PRODUCT_FILTERS),
  );
  protected readonly isMobileFiltersOpen = signal<boolean>(false);
  private lastAppliedSignature = '';

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.applyFromQueryParamMap(params);
    });

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

  protected readonly contextFilterChips = computed<readonly ActiveFilterChip[]>(() => {
    const context = this.contextQuery();
    const chips: ActiveFilterChip[] = [];

    if (context.q) {
      chips.push({
        id: 'context:q',
        label: `Búsqueda: ${context.q}`,
        remove: () => this.removeContextParam('q'),
      });
    }

    if (context.categoria) {
      const category = this.catalog.getCategory(context.categoria);
      chips.push({
        id: 'context:categoria',
        label: category?.name ?? context.categoria,
        remove: () => this.removeContextParam('categoria'),
      });
    }

    if (context.subcategoria) {
      const category = context.categoria ? this.catalog.getCategory(context.categoria) : undefined;
      const subcategory =
        category?.subcategories.find((s) => s.id === context.subcategoria) ??
        this.catalog.categories
          .flatMap((c) => c.subcategories)
          .find((s) => s.id === context.subcategoria);
      chips.push({
        id: 'context:subcategoria',
        label: subcategory?.name ?? context.subcategoria,
        remove: () => this.removeContextParam('subcategoria'),
      });
    }

    if (context.proveedor) {
      const seller = this.catalog.getSeller(context.proveedor);
      chips.push({
        id: 'context:proveedor',
        label: seller?.name ?? context.proveedor,
        remove: () => this.removeContextParam('proveedor'),
      });
    }

    return chips;
  });

  protected readonly effectiveSummary = computed<ProductListingSummary>(() => {
    const baseSummary = this.summary();
    if (baseSummary !== PRODUCT_LISTING_SUMMARY) {
      return baseSummary;
    }

    const context = this.contextQuery();
    const hasContext = Boolean(
      context.q || context.categoria || context.subcategoria || context.proveedor,
    );
    if (!hasContext) {
      return baseSummary;
    }

    const breadcrumbs: ProductBreadcrumbItem[] = [
      { label: 'Inicio', routerLink: '/' },
      { label: 'Productos', routerLink: '/productos' },
    ];
    let categoryTitle = baseSummary.categoryTitle;

    if (context.categoria) {
      const category = this.catalog.getCategory(context.categoria);
      const categoryLabel = category?.name ?? context.categoria;
      breadcrumbs.push({
        label: categoryLabel,
        routerLink: '/productos',
        queryParams: { categoria: context.categoria },
      });
      categoryTitle = categoryLabel;
    }

    if (context.subcategoria) {
      const category = context.categoria ? this.catalog.getCategory(context.categoria) : undefined;
      const subcategory =
        category?.subcategories.find((s) => s.id === context.subcategoria) ??
        this.catalog.categories
          .flatMap((c) => c.subcategories)
          .find((s) => s.id === context.subcategoria);
      const subcategoryLabel = subcategory?.name ?? context.subcategoria;
      breadcrumbs.push({ label: subcategoryLabel });
      categoryTitle = subcategoryLabel;
    }

    if (context.proveedor) {
      const seller = this.catalog.getSeller(context.proveedor);
      const sellerLabel = seller?.name ?? context.proveedor;
      breadcrumbs.push({ label: sellerLabel });
      if (!context.categoria && !context.subcategoria) {
        categoryTitle = sellerLabel;
      }
    }

    if (context.q) {
      breadcrumbs.push({ label: `Búsqueda: "${context.q}"` });
      if (!context.categoria && !context.subcategoria && !context.proveedor) {
        categoryTitle = `Resultados para "${context.q}"`;
      }
    }

    return {
      categoryTitle,
      totalResults: baseSummary.totalResults,
      breadcrumbs,
    };
  });

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
      active.origins.length +
      this.contextFilterChips().length
    );
  });

  protected readonly hasActiveCatalogFilters = computed<boolean>(() => {
    return (
      this.appliedFilterCount() > 0 ||
      this.hasUnmatchedBrandParam() ||
      this.hasUnmatchedOriginParam()
    );
  });

  protected readonly filteredProducts = computed<readonly Product[]>(() => {
    const active = this.appliedFilters();
    const context = this.contextQuery();

    if (this.hasUnmatchedBrandParam() || this.hasUnmatchedOriginParam()) {
      return [];
    }

    const isPriceModified =
      active.priceRange.min > DEFAULT_PRICE_RANGE.min ||
      active.priceRange.max < DEFAULT_PRICE_RANGE.max;

    const sourceProducts = this.products();
    const usingSharedCatalog = sourceProducts === PRODUCT_LISTING_ITEMS;
    const hasContextQuery = Boolean(
      context.q || context.categoria || context.subcategoria || context.proveedor,
    );

    const catalogMatchingIds =
      usingSharedCatalog && (hasContextQuery || active.minRating !== null)
        ? new Set(
            this.catalog
              .listProducts({
                q: context.q || undefined,
                categoria: context.categoria || undefined,
                subcategoria: context.subcategoria || undefined,
                proveedor: context.proveedor || undefined,
                minRating: active.minRating ?? undefined,
              })
              .map((p) => p.id),
          )
        : null;

    const matching = sourceProducts.filter((product) => {
      if (catalogMatchingIds && !catalogMatchingIds.has(product.id)) {
        return false;
      }

      if (!usingSharedCatalog) {
        if (context.categoria && product.categoryId !== context.categoria) {
          return false;
        }
        if (context.subcategoria && product.subcategoryId !== context.subcategoria) {
          return false;
        }
        if (context.proveedor && product.sellerId !== context.proveedor) {
          return false;
        }
      }

      if (active.minRating !== null && (product.rating ?? -1) < active.minRating) {
        return false;
      }

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
          (brand) =>
            brand.toLowerCase() === product.brand.toLowerCase() ||
            brand.toLowerCase() === product.brandId?.toLowerCase(),
        );
        if (!matchesBrand) {
          return false;
        }
      }

      if (active.origins.length > 0) {
        if (
          !product.origin ||
          !active.origins.some((origin) => origin.toLowerCase() === product.origin!.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });

    return this.sortProducts(matching, active.sortBy);
  });

  protected readonly totalPages = computed<number>(() => {
    const totalItems = this.filteredProducts().length;
    return totalItems > 0 ? Math.ceil(totalItems / this.pageSize) : 0;
  });

  protected readonly safeCurrentPage = computed<number>(() => {
    const total = this.totalPages();
    if (total === 0) {
      return 1;
    }
    return Math.min(Math.max(1, this.currentPage()), total);
  });

  protected readonly paginatedProducts = computed<readonly Product[]>(() => {
    const items = this.filteredProducts();
    if (!items.length) {
      return [];
    }
    const start = (this.safeCurrentPage() - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  });

  protected readonly displayedTotalResults = computed<number>(() =>
    this.hasActiveCatalogFilters() ? this.filteredProducts().length : this.summary().totalResults,
  );

  protected setViewMode(mode: ProductViewMode): void {
    this.viewMode.set(mode);
  }

  protected onClearContext(): void {
    this.contextQuery.set(EMPTY_CONTEXT_QUERY);
    this.hasUnmatchedBrandParam.set(false);
    this.hasUnmatchedOriginParam.set(false);
  }

  protected onFiltersChange(nextFilters: ProductFiltersState): void {
    const cloned = cloneFiltersState(nextFilters);
    this.appliedFilters.set(cloned);
    this.hasUnmatchedBrandParam.set(false);
    this.hasUnmatchedOriginParam.set(false);
    this.currentPage.set(1);
    this.isMobileFiltersOpen.set(false);
    this.syncUrl(this.contextQuery(), cloned);
  }

  protected onPageChange(page: number): void {
    const total = this.totalPages();
    if (page < 1 || page > total || page === this.safeCurrentPage()) {
      return;
    }
    this.currentPage.set(page);
    this.scrollToResultsHeader();
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

  private removeContextParam(key: keyof CatalogContextQuery): void {
    const current = this.contextQuery();
    const nextContext: CatalogContextQuery = {
      ...current,
      [key]: '',
      ...(key === 'categoria' ? { subcategoria: '' } : {}),
    };
    this.contextQuery.set(nextContext);
    this.currentPage.set(1);
    this.syncUrl(nextContext, this.appliedFilters());
  }

  private applyFromQueryParamMap(params: ParamMap): void {
    const nextContext: CatalogContextQuery = {
      q: (params.get('q') ?? '').trim(),
      categoria: (params.get('categoria') ?? '').trim(),
      subcategoria: (params.get('subcategoria') ?? '').trim(),
      proveedor: (params.get('proveedor') ?? '').trim(),
    };

    const rawBrands = params
      .getAll('marca')
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter(Boolean);
    const matchedBrands = [
      ...new Set(
        rawBrands.flatMap((token) => {
          const lower = token.toLowerCase();
          const catalogBrand = this.catalog.brands.find(
            (b) => b.id.toLowerCase() === lower || b.name.toLowerCase() === lower,
          );
          if (catalogBrand) {
            return [catalogBrand.name];
          }
          const knownName = PRODUCT_BRANDS.find((name) => name.toLowerCase() === lower);
          return knownName ? [knownName] : [];
        }),
      ),
    ];
    const unmatchedBrand = rawBrands.length > 0 && matchedBrands.length === 0;

    const rawOrigins = params
      .getAll('origen')
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter(Boolean);
    const matchedOrigins = [
      ...new Set(
        rawOrigins.flatMap((token) => {
          const lower = token.toLowerCase();
          const matched = PRODUCT_ORIGINS.find((origin) => origin.toLowerCase() === lower);
          return matched ? [matched] : [];
        }),
      ),
    ];
    const unmatchedOrigin = rawOrigins.length > 0 && matchedOrigins.length === 0;

    const rawRating = params.get('minRating');
    const parsedRating =
      rawRating !== null && rawRating.trim() !== '' ? Number(rawRating.trim()) : NaN;
    const minRating =
      Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5
        ? parsedRating
        : null;

    const supplierVerification = [
      ...new Set(
        params
          .getAll('verificacion')
          .flatMap((value) => value.split(','))
          .map((value) => value.trim())
          .filter(
            (value): value is SupplierVerificationFilter =>
              value === 'verified' || value === 'unverified',
          ),
      ),
    ];

    const purchaseCapacity = [
      ...new Set(
        params
          .getAll('capacidad')
          .flatMap((value) => value.split(','))
          .map((value) => value.trim())
          .filter(
            (value): value is PurchaseCapacityFilter =>
              value === 'Por unidad' || value === 'Por mayor',
          ),
      ),
    ];

    const rawMinPrice = params.get('priceMin');
    const rawMaxPrice = params.get('priceMax');
    const parsedMinPrice =
      rawMinPrice !== null && rawMinPrice.trim() !== '' ? Number(rawMinPrice) : NaN;
    const parsedMaxPrice =
      rawMaxPrice !== null && rawMaxPrice.trim() !== '' ? Number(rawMaxPrice) : NaN;
    const clampedMin = Number.isFinite(parsedMinPrice)
      ? Math.max(DEFAULT_PRICE_RANGE.min, Math.min(parsedMinPrice, DEFAULT_PRICE_RANGE.max))
      : DEFAULT_PRICE_RANGE.min;
    const clampedMax = Number.isFinite(parsedMaxPrice)
      ? Math.min(DEFAULT_PRICE_RANGE.max, Math.max(parsedMaxPrice, clampedMin))
      : DEFAULT_PRICE_RANGE.max;

    const rawSort = params.get('sort')?.trim();
    const sortBy: ProductSort =
      rawSort === 'newest' ||
      rawSort === 'price-asc' ||
      rawSort === 'price-desc' ||
      rawSort === 'relevance'
        ? rawSort
        : 'relevance';

    const nextFilters: ProductFiltersState = {
      sortBy,
      supplierVerification,
      priceRange: { min: clampedMin, max: clampedMax },
      purchaseCapacity,
      minRating,
      brands: matchedBrands,
      origins: matchedOrigins,
    };

    const signature = JSON.stringify({
      nextContext,
      nextFilters,
      unmatchedBrand,
      unmatchedOrigin,
    });
    if (signature === this.lastAppliedSignature) {
      return;
    }

    this.lastAppliedSignature = signature;
    this.contextQuery.set(nextContext);
    this.hasUnmatchedBrandParam.set(unmatchedBrand);
    this.hasUnmatchedOriginParam.set(unmatchedOrigin);
    this.appliedFilters.set(cloneFiltersState(nextFilters));
    this.currentPage.set(1);
  }

  private syncUrl(context: CatalogContextQuery, filters: ProductFiltersState): void {
    this.lastAppliedSignature = JSON.stringify({
      nextContext: context,
      nextFilters: filters,
      unmatchedBrand: false,
      unmatchedOrigin: false,
    });
    const queryParams = this.buildQueryParams(context, filters);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }

  private buildQueryParams(context: CatalogContextQuery, filters: ProductFiltersState): Params {
    const queryParams: Params = {};

    if (context.q) {
      queryParams['q'] = context.q;
    }
    if (context.categoria) {
      queryParams['categoria'] = context.categoria;
    }
    if (context.subcategoria) {
      queryParams['subcategoria'] = context.subcategoria;
    }
    if (context.proveedor) {
      queryParams['proveedor'] = context.proveedor;
    }

    if (filters.brands.length > 0) {
      const brandIds = filters.brands.map(
        (name) =>
          this.catalog.brands.find((b) => b.name.toLowerCase() === name.toLowerCase())?.id ?? name,
      );
      queryParams['marca'] = brandIds.length === 1 ? brandIds[0] : brandIds;
    }

    if (filters.origins.length > 0) {
      queryParams['origen'] =
        filters.origins.length === 1 ? filters.origins[0] : [...filters.origins];
    }

    if (filters.minRating !== null) {
      queryParams['minRating'] = String(filters.minRating);
    }

    if (filters.supplierVerification.length > 0) {
      queryParams['verificacion'] =
        filters.supplierVerification.length === 1
          ? filters.supplierVerification[0]
          : [...filters.supplierVerification];
    }

    if (filters.purchaseCapacity.length > 0) {
      queryParams['capacidad'] =
        filters.purchaseCapacity.length === 1
          ? filters.purchaseCapacity[0]
          : [...filters.purchaseCapacity];
    }

    if (filters.priceRange.min > DEFAULT_PRICE_RANGE.min) {
      queryParams['priceMin'] = String(filters.priceRange.min);
    }

    if (filters.priceRange.max < DEFAULT_PRICE_RANGE.max) {
      queryParams['priceMax'] = String(filters.priceRange.max);
    }

    if (filters.sortBy !== 'relevance') {
      queryParams['sort'] = filters.sortBy;
    }

    return queryParams;
  }

  private scrollToResultsHeader(): void {
    const headerEl = this.resultsHeader()?.nativeElement;
    if (!headerEl || typeof headerEl.scrollIntoView !== 'function') {
      return;
    }
    const win = this.document?.defaultView;
    const prefersReducedMotion =
      typeof win?.matchMedia === 'function' &&
      win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    headerEl.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
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
