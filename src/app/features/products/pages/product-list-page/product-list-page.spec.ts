import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';
import { PRODUCT_LISTING_ITEMS, PRODUCT_LISTING_SUMMARY } from '../../data/product-listing.data';
import { ProductListPage } from './product-list-page';

describe('ProductListPage', () => {
  let fixture: ComponentFixture<ProductListPage>;
  let element: HTMLElement;

  const gridButton = () =>
    element.querySelector<HTMLButtonElement>('button[aria-label="Vista en cuadrícula"]')!;
  const listButton = () =>
    element.querySelector<HTMLButtonElement>('button[aria-label="Vista en lista"]')!;
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
    expect(breadcrumbItems.map((item) => item.textContent?.trim())).toEqual([
      'Inicio',
      'Schneider',
    ]);
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

  it('starts in Grid mode using ProductCard default with accessible toggle controls', () => {
    const listContainer = element.querySelector<HTMLUListElement>('.product-list__items');

    expect(gridButton().type).toBe('button');
    expect(listButton().type).toBe('button');
    expect(gridButton().getAttribute('aria-pressed')).toBe('true');
    expect(listButton().getAttribute('aria-pressed')).toBe('false');
    expect(gridButton().classList.contains('product-list__view-button--active')).toBe(true);
    expect(listButton().classList.contains('product-list__view-button--active')).toBe(false);
    expect(listContainer?.classList.contains('product-list__items--grid')).toBe(true);
    expect(listContainer?.classList.contains('product-list__items--list')).toBe(false);
    expect(cards()).toHaveLength(PRODUCT_LISTING_ITEMS.length);
    expect(cards().every((card) => card.variant() === 'default')).toBe(true);
  });

  it('switches to List mode with ProductCard list and returns to Grid mode preserving the same product collection', async () => {
    const initialCount = cards().length;

    listButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    const listContainer = element.querySelector<HTMLUListElement>('.product-list__items');
    expect(gridButton().getAttribute('aria-pressed')).toBe('false');
    expect(listButton().getAttribute('aria-pressed')).toBe('true');
    expect(listButton().classList.contains('product-list__view-button--active')).toBe(true);
    expect(listContainer?.classList.contains('product-list__items--list')).toBe(true);
    expect(listContainer?.classList.contains('product-list__items--grid')).toBe(false);
    expect(cards()).toHaveLength(initialCount);
    expect(cards().every((card) => card.variant() === 'list')).toBe(true);
    expect(element.querySelectorAll('.product-card--list')).toHaveLength(initialCount);

    gridButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(gridButton().getAttribute('aria-pressed')).toBe('true');
    expect(listButton().getAttribute('aria-pressed')).toBe('false');
    expect(listContainer?.classList.contains('product-list__items--grid')).toBe(true);
    expect(cards()).toHaveLength(initialCount);
    expect(cards().every((card) => card.variant() === 'default')).toBe(true);
    expect(element.querySelectorAll('.product-card--default')).toHaveLength(initialCount);
  });

  it('handles an empty product list gracefully without breaking the page', async () => {
    fixture.componentRef.setInput('products', []);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cards()).toHaveLength(0);
    expect(element.querySelector('.product-list__items')).toBeNull();
    expect(element.querySelector('.product-list__empty')?.textContent?.trim()).toBe(
      'No se encontraron productos disponibles.',
    );
    expect(gridButton().getAttribute('aria-pressed')).toBe('true');
  });
});
