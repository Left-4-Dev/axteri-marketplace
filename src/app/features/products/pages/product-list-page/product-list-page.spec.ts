import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';
import { ProductFilters } from '../../components/product-filters/product-filters';
import { ProductPagination } from '../../components/product-pagination/product-pagination';
import { PRODUCT_LISTING_ITEMS, PRODUCT_LISTING_SUMMARY } from '../../data/product-listing.data';
import { PRODUCT_LIST_PAGE_SIZE, ProductListPage } from './product-list-page';

function buildMultiPageProducts(totalCount = PRODUCT_LIST_PAGE_SIZE + 5): readonly Product[] {
  return Array.from({ length: totalCount }, (_, index) => {
    const base = PRODUCT_LISTING_ITEMS[index % PRODUCT_LISTING_ITEMS.length];
    return {
      ...base,
      // Controlled assortment for pagination and filter interactions.
      brand: 'Schneider Electric',
      price: {
        kind: 'fixed',
        amount: index + 1,
        currency: 'PEN',
        unitLabel: index % 5 < 2 ? 'Por unidad' : 'Por mayor',
      },

      id: `${base.id}-fixture-${index + 1}`,
    };
  });
}

describe('ProductListPage', () => {
  let fixture: ComponentFixture<ProductListPage>;
  let element: HTMLElement;

  const gridButton = () =>
    element.querySelector<HTMLButtonElement>('button[aria-label="Vista en cuadrícula"]')!;
  const listButton = () =>
    element.querySelector<HTMLButtonElement>('button[aria-label="Vista en lista"]')!;
  const applyButton = () =>
    element.querySelector<HTMLButtonElement>('app-button[variant="primary"] button')!;
  const clearButton = () =>
    element.querySelector<HTMLButtonElement>('app-button[variant="light"] button')!;
  const pageButton = (page: number) =>
    element.querySelector<HTMLButtonElement>(`button[aria-label="Ir a la página ${page}"]`);
  const cards = () =>
    fixture.debugElement
      .queryAll(By.directive(ProductCard))
      .map((debugEl) => debugEl.componentInstance as ProductCard);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPage);
    await fixture.whenStable();
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the semantic breadcrumb, category title, and product count', () => {
    const breadcrumbNav = element.querySelector<HTMLElement>('nav.product-list__breadcrumb');
    const breadcrumbList = breadcrumbNav?.querySelector<HTMLOListElement>(
      'ol.product-list__breadcrumb-list',
    );
    const breadcrumbItems = Array.from(
      breadcrumbList?.querySelectorAll<HTMLLIElement>('li.product-list__breadcrumb-item') ?? [],
    );
    const homeLink = breadcrumbItems[0]?.querySelector<HTMLAnchorElement>(
      'a.product-list__breadcrumb-link',
    );
    const currentCrumb = breadcrumbItems[1];
    const title = element.querySelector<HTMLHeadingElement>('#product-list-title');
    const count = element.querySelector<HTMLParagraphElement>('.product-list__count');

    expect(breadcrumbNav?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(breadcrumbList).not.toBeNull();
    expect(breadcrumbItems.map((item) => item.textContent?.trim())).toEqual(
      PRODUCT_LISTING_SUMMARY.breadcrumbs.map((crumb) => crumb.label),
    );
    expect(homeLink?.getAttribute('href')).toBe('/');
    expect(breadcrumbItems[0]?.getAttribute('aria-current')).toBeNull();
    expect(currentCrumb?.querySelector('a')).toBeNull();
    expect(currentCrumb?.getAttribute('aria-current')).toBe('page');
    expect(currentCrumb?.classList.contains('product-list__breadcrumb-current')).toBe(true);
    expect(title?.textContent?.trim()).toBe(PRODUCT_LISTING_SUMMARY.categoryTitle);
    expect(count?.textContent?.trim()).toBe(
      `${PRODUCT_LISTING_SUMMARY.totalResults} productos encontrados`,
    );
  });

  it('supports multi-level breadcrumbs keeping intermediate levels navigable or plain and only the last item as current page', async () => {
    fixture.componentRef.setInput('summary', {
      ...PRODUCT_LISTING_SUMMARY,
      breadcrumbs: [
        { label: 'Inicio', routerLink: '/' },
        { label: 'Productos', routerLink: '/productos' },
        { label: 'Schneider' },
      ],
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const items = Array.from(
      element.querySelectorAll<HTMLLIElement>('li.product-list__breadcrumb-item'),
    );

    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'Inicio',
      'Productos',
      'Schneider',
    ]);
    expect(items[0]?.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(items[1]?.querySelector('a')?.getAttribute('href')).toBe('/productos');
    expect(items[1]?.getAttribute('aria-current')).toBeNull();
    expect(items[1]?.classList.contains('product-list__breadcrumb-current')).toBe(false);
    expect(items[2]?.querySelector('a')).toBeNull();
    expect(items[2]?.getAttribute('aria-current')).toBe('page');
    expect(items[2]?.classList.contains('product-list__breadcrumb-current')).toBe(true);
  });

  it('uses pageSize = 40 by default, hides the paginator when total products fit in one page, and links cards to /productos/:id', () => {
    expect(PRODUCT_LIST_PAGE_SIZE).toBe(40);
    expect(cards()).toHaveLength(PRODUCT_LISTING_ITEMS.length);
    expect(fixture.debugElement.query(By.directive(ProductPagination))).toBeNull();
    const w22Links = element.querySelectorAll<HTMLAnchorElement>(
      'a[href="/productos/weg-w22-3kw"]',
    );
    expect(w22Links).toHaveLength(2);
  });

  it('renders only pageSize products on page 1 and displays the next slice on page 2 without duplicates when products exceed 40', async () => {
    const multiPageItems = buildMultiPageProducts(45);
    fixture.componentRef.setInput('products', multiPageItems);
    await fixture.whenStable();
    fixture.detectChanges();

    const page1Ids = cards().map((card) => card.product().id);
    expect(page1Ids).toEqual(
      multiPageItems.slice(0, PRODUCT_LIST_PAGE_SIZE).map((item) => item.id),
    );
    expect(cards().every((card) => card.variant() === 'default')).toBe(true);

    pageButton(2)?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const page2Ids = cards().map((card) => card.product().id);
    expect(page2Ids).toEqual(multiPageItems.slice(PRODUCT_LIST_PAGE_SIZE).map((item) => item.id));
    expect(page1Ids.some((id) => page2Ids.includes(id))).toBe(false);
  });

  it('preserves the current page and its products when switching between Grid and List modes', async () => {
    const multiPageItems = buildMultiPageProducts(45);
    fixture.componentRef.setInput('products', multiPageItems);
    await fixture.whenStable();
    fixture.detectChanges();

    pageButton(2)?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const expectedPage2Ids = multiPageItems.slice(PRODUCT_LIST_PAGE_SIZE).map((item) => item.id);

    listButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(pageButton(2)?.getAttribute('aria-current')).toBe('page');
    expect(cards().map((card) => card.product().id)).toEqual(expectedPage2Ids);
    expect(cards().every((card) => card.variant() === 'list')).toBe(true);

    gridButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(pageButton(2)?.getAttribute('aria-current')).toBe('page');
    expect(cards().map((card) => card.product().id)).toEqual(expectedPage2Ids);
    expect(cards().every((card) => card.variant() === 'default')).toBe(true);
  });

  it('does not reset the current page when editing draftFilters, and resets to page 1 upon APLICAR FILTROS or chip removal', async () => {
    const multiPageItems = buildMultiPageProducts(45);
    fixture.componentRef.setInput('products', multiPageItems);
    await fixture.whenStable();
    fixture.detectChanges();

    pageButton(2)?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(pageButton(2)?.getAttribute('aria-current')).toBe('page');

    const schneiderCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Schneider Electric"]',
    )!;
    schneiderCheckbox.click();
    await fixture.whenStable();
    fixture.detectChanges();

    // Still on page 2 while only editing draftFilters
    expect(pageButton(2)?.getAttribute('aria-current')).toBe('page');

    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    // Reset to page 1 after applying filters
    expect(pageButton(1)?.getAttribute('aria-current')).toBe('page');

    // Navigate to page 2 again, then remove the applied Schneider chip -> resets to page 1
    pageButton(2)?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(pageButton(2)?.getAttribute('aria-current')).toBe('page');

    const removeChipBtn = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Quitar filtro Schneider Electric"]',
    )!;
    removeChipBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(pageButton(1)?.getAttribute('aria-current')).toBe('page');
  });

  it('computes pagination from filteredProducts and hides pagination when filtered results fit in a single page', async () => {
    const multiPageItems = buildMultiPageProducts(45);
    fixture.componentRef.setInput('products', multiPageItems);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(ProductFilters))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(ProductPagination))).not.toBeNull();

    const unitCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Por unidad"]',
    )!;
    unitCheckbox.click();
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    // 18 matching products <= pageSize (40), so totalPages === 1 and pagination is omitted
    expect(cards()).toHaveLength(18);
    expect(element.querySelector('.product-list__count')?.textContent?.trim()).toBe(
      '18 productos encontrados',
    );
    expect(fixture.debugElement.query(By.directive(ProductPagination))).toBeNull();
  });

  it('applies combined filters (brand + verification + purchase capacity + price range + sort) and restores results on Limpiar + APLICAR FILTROS', async () => {
    const schneiderCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Schneider Electric"]',
    )!;
    const verifiedCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="verified"]',
    )!;
    const wholesaleCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Por unidad"]',
    )!;
    const maxRangeInput = element.querySelector<HTMLInputElement>(
      'input[type="range"][aria-label="Precio máximo"]',
    )!;
    const priceAscRadio = element.querySelector<HTMLInputElement>(
      'input[type="radio"][name="product-sort"][value="price-asc"]',
    )!;

    schneiderCheckbox.click();
    verifiedCheckbox.click();
    wholesaleCheckbox.click();
    maxRangeInput.value = '1000';
    maxRangeInput.dispatchEvent(new Event('input'));
    priceAscRadio.click();
    priceAscRadio.dispatchEvent(new Event('change'));
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cards().map((card) => card.product().id)).toEqual([
      'schneider-c60h-dc-1',
      'schneider-llave-fuerza-1',
    ]);

    clearButton().click();
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cards()).toHaveLength(PRODUCT_LISTING_ITEMS.length);
  });

  it('opens and closes the mobile filters panel via × or Escape without changing results, and closes on apply', async () => {
    const toggleBtn = element.querySelector<HTMLButtonElement>('.product-list__filters-toggle')!;
    const closeBtn = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Cerrar filtros"]',
    )!;
    const sidebar = element.querySelector<HTMLElement>('#product-list-filters-sidebar')!;
    const unitCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Por unidad"]',
    )!;

    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    expect(sidebar.classList.contains('product-list__sidebar--open')).toBe(false);

    toggleBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
    expect(sidebar.classList.contains('product-list__sidebar--open')).toBe(true);

    unitCheckbox.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(unitCheckbox.checked).toBe(true);

    closeBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    expect(sidebar.classList.contains('product-list__sidebar--open')).toBe(false);
    expect(unitCheckbox.checked).toBe(false);
    expect(cards()).toHaveLength(PRODUCT_LISTING_ITEMS.length);

    // Reopen, edit draft, and close via Escape -> discards draft and keeps results intact
    toggleBtn.click();
    unitCheckbox.click();
    await fixture.whenStable();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    expect(sidebar.classList.contains('product-list__sidebar--open')).toBe(false);
    expect(unitCheckbox.checked).toBe(false);

    // Reopen, select filter, and apply -> closes panel and updates results
    toggleBtn.click();
    unitCheckbox.click();
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    expect(sidebar.classList.contains('product-list__sidebar--open')).toBe(false);
    const unitProducts = PRODUCT_LISTING_ITEMS.filter(
      (p) => p.price.kind !== 'quote' && p.price.unitLabel === 'Por unidad',
    );
    expect(
      cards()
        .map((c) => c.product().id)
        .sort(),
    ).toEqual(unitProducts.map((p) => p.id).sort());
  });

  it('displays the empty state and keeps sidebar filters accessible when applied filters match 0 products', async () => {
    const siemensCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Siemens"]',
    )!;
    const wholesale = element.querySelector<HTMLInputElement>('input[value="Por mayor"]')!;
    wholesale.click();
    siemensCheckbox.click();
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cards()).toHaveLength(0);
    expect(element.querySelector('.product-list__items')).toBeNull();
    expect(fixture.debugElement.query(By.directive(ProductPagination))).toBeNull();
    expect(element.querySelector('.product-list__empty')?.textContent?.trim()).toBe(
      'No se encontraron productos disponibles.',
    );
    expect(fixture.debugElement.query(By.directive(ProductFilters))).not.toBeNull();
  });

  it('handles an empty product list gracefully and hides pagination', async () => {
    fixture.componentRef.setInput('products', []);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cards()).toHaveLength(0);
    expect(element.querySelector('.product-list__items')).toBeNull();
    expect(fixture.debugElement.query(By.directive(ProductPagination))).toBeNull();
    expect(element.querySelector('.product-list__empty')?.textContent?.trim()).toBe(
      'No se encontraron productos disponibles.',
    );
    expect(gridButton().getAttribute('aria-pressed')).toBe('true');
  });

  it('filters genuinely by origin and minimum rating without inventing missing attributes', async () => {
    const brasilCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Brasil"]',
    )!;
    const fourStarBtn = element.querySelector<HTMLButtonElement>(
      'button[aria-label="4 estrellas o más"]',
    )!;

    brasilCheckbox.click();
    fourStarBtn.click();
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cards().map((card) => card.product().id)).toEqual(['weg-w22-3kw']);
    expect(element.querySelector('.product-list__count')?.textContent?.trim()).toBe(
      '1 productos encontrados',
    );

    // 5 stars should exclude weg-w22-3kw (rating 4.4) and products without rating
    const fiveStarBtn = element.querySelector<HTMLButtonElement>(
      'button[aria-label="5 estrellas o más"]',
    )!;
    fiveStarBtn.click();
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cards()).toHaveLength(0);
    expect(element.querySelector('.product-list__count')?.textContent?.trim()).toBe(
      '0 productos encontrados',
    );

    // Clear and test an origin with no products in catalog (Alemania)
    clearButton().click();
    const germanyCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Alemania"]',
    )!;
    germanyCheckbox.click();
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cards()).toHaveLength(0);
  });
});

describe('ProductListPage URL Synchronization & Navigation Flows', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: ProductListPage },
          { path: 'productos', component: ProductListPage },
        ]),
        provideLocationMocks(),
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    harness = await RouterTestingHarness.create();
    router.initialNavigation();
  });

  function renderedCards(): ProductCard[] {
    return harness.fixture.debugElement
      .queryAll(By.directive(ProductCard))
      .map((el) => el.componentInstance as ProductCard);
  }

  it('initializes from query params (q, categoria, marca, proveedor, origen, minRating) with accent/case-insensitive search', async () => {
    await harness.navigateByUrl(
      '/productos?categoria=electrical-materials&marca=weg&proveedor=ldf-projects&q=TRIFASICO&origen=Brasil&minRating=4',
    );
    harness.detectChanges();

    expect(renderedCards().map((c) => c.product().id)).toEqual(['weg-w22-3kw']);
    const pageEl = harness.routeNativeElement!;
    expect(pageEl.querySelector('.product-list__count')?.textContent?.trim()).toBe(
      '1 productos encontrados',
    );
    const chips = Array.from(
      pageEl.querySelectorAll<HTMLButtonElement>('button.product-filters__chip'),
      (btn) => btn.textContent?.replace('×', '').trim(),
    );
    expect(chips).toEqual([
      'Búsqueda: TRIFASICO',
      'Materiales eléctricos y electrónicos',
      'LDF Projects',
      '4 ★ a más',
      'WEG',
      'Brasil',
    ]);
  });

  it('synchronizes applied filters, chip removal, and Limpiar with the URL and supports browser back/forward', async () => {
    await harness.navigateByUrl('/productos?categoria=hydraulics');
    harness.detectChanges();

    const pageEl = harness.routeNativeElement!;
    expect(renderedCards().map((c) => c.product().id)).toEqual([
      'grundfos-cm5',
      'atlas-ga15',
      'ingersoll-ss3l3',
    ]);
    expect(pageEl.querySelector('#product-list-title')?.textContent?.trim()).toBe(
      'Equipos hidráulicos y neumáticos',
    );

    // Combine with a brand filter in sidebar
    const atlasCheckbox = pageEl.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Atlas"]',
    )!;
    const applyBtn = pageEl.querySelector<HTMLButtonElement>(
      'app-button[variant="primary"] button',
    )!;
    atlasCheckbox.click();
    applyBtn.click();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/productos?categoria=hydraulics&marca=atlas');
    expect(renderedCards().map((c) => c.product().id)).toEqual(['atlas-ga15']);

    // Browser Back restores previous state (/productos?categoria=hydraulics)
    location.back();
    await new Promise((resolve) => setTimeout(resolve, 10));
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/productos?categoria=hydraulics');
    expect(renderedCards()).toHaveLength(3);

    // Browser Forward reapplies (/productos?categoria=hydraulics&marca=atlas)
    location.forward();
    await new Promise((resolve) => setTimeout(resolve, 10));
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/productos?categoria=hydraulics&marca=atlas');
    expect(renderedCards().map((c) => c.product().id)).toEqual(['atlas-ga15']);

    // Clear all filters (LIMPIAR + APLICAR FILTROS) resets URL to /productos
    const clearBtn = pageEl.querySelector<HTMLButtonElement>('app-button[variant="light"] button')!;
    clearBtn.click();
    applyBtn.click();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/productos');
    expect(renderedCards()).toHaveLength(PRODUCT_LISTING_ITEMS.length);
  });

  it('handles invalid query parameters and zero-result searches without errors or redirects', async () => {
    await harness.navigateByUrl(
      '/productos?categoria=inexistente&minRating=99&priceMin=-500&sort=invalido',
    );
    harness.detectChanges();

    const pageEl = harness.routeNativeElement!;
    expect(router.url).toBe(
      '/productos?categoria=inexistente&minRating=99&priceMin=-500&sort=invalido',
    );
    expect(renderedCards()).toHaveLength(0);
    expect(pageEl.querySelector('.product-list__empty')?.textContent?.trim()).toBe(
      'No se encontraron productos disponibles.',
    );

    await harness.navigateByUrl('/productos?marca=marca-inexistente');
    harness.detectChanges();
    expect(renderedCards()).toHaveLength(0);

    await harness.navigateByUrl('/productos?q=termino-sin-coincidencias-xyz');
    harness.detectChanges();
    expect(renderedCards()).toHaveLength(0);
    expect(pageEl.querySelector('.product-list__count')?.textContent?.trim()).toBe(
      '0 productos encontrados',
    );
  });
});
