import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
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
      'input[type="checkbox"][value="Schneider"]',
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
      'button[aria-label="Quitar filtro Schneider"]',
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
      'input[type="checkbox"][value="Schneider"]',
    )!;
    const verifiedCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="verified"]',
    )!;
    const wholesaleCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Por mayor"]',
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

    // Only weg-w22-3kw (fixed 345, Por mayor, verified, Schneider) matches <= 1000
    expect(cards().map((card) => card.product().id)).toEqual(['weg-w22-3kw']);

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
    expect(cards()).toHaveLength(4);
  });

  it('displays the empty state and keeps sidebar filters accessible when applied filters match 0 products', async () => {
    const siemensCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Siemens"]',
    )!;
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
});
