import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductPagination } from './product-pagination';

describe('ProductPagination', () => {
  let fixture: ComponentFixture<ProductPagination>;
  let component: ProductPagination;
  let element: HTMLElement;
  let emittedPages: number[];

  const prevButton = () =>
    element.querySelector<HTMLButtonElement>('button[aria-label="Página anterior"]');
  const nextButton = () =>
    element.querySelector<HTMLButtonElement>('button[aria-label="Página siguiente"]');
  const pageButtons = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('button.product-pagination__page'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPagination);
    component = fixture.componentInstance;
    emittedPages = [];
    component.pageChange.subscribe((page) => emittedPages.push(page));
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('totalPages', 3);
    await fixture.whenStable();
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders page buttons and marks the current page with aria-current="page"', () => {
    const pages = pageButtons();
    expect(pages.map((btn) => btn.textContent?.trim())).toEqual(['1', '2', '3']);
    expect(pages[0].getAttribute('aria-current')).toBe('page');
    expect(pages[1].getAttribute('aria-current')).toBeNull();
    expect(pages[2].getAttribute('aria-current')).toBeNull();
  });

  it('emits pageChange when clicking a different page button and ignores clicking the active page', () => {
    const pages = pageButtons();
    pages[0].click();
    expect(emittedPages).toEqual([]);

    pages[1].click();
    expect(emittedPages).toEqual([2]);
  });

  it('disables Anterior on page 1 and emits currentPage - 1 when enabled', async () => {
    expect(prevButton()?.disabled).toBe(true);

    fixture.componentRef.setInput('currentPage', 2);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(prevButton()?.disabled).toBe(false);
    prevButton()?.click();
    expect(emittedPages).toEqual([1]);
  });

  it('disables Siguiente on the last page and emits currentPage + 1 when enabled', async () => {
    expect(nextButton()?.disabled).toBe(false);
    nextButton()?.click();
    expect(emittedPages).toEqual([2]);

    fixture.componentRef.setInput('currentPage', 3);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(nextButton()?.disabled).toBe(true);
  });

  it('windows large page counts with ellipsis and prevents out-of-range page selection', async () => {
    fixture.componentRef.setInput('totalPages', 20);
    fixture.componentRef.setInput('currentPage', 10);
    await fixture.whenStable();
    fixture.detectChanges();

    const pages = pageButtons().map((btn) => btn.textContent?.trim());
    expect(pages).toEqual(['1', '9', '10', '11', '20']);
    expect(element.querySelectorAll('.product-pagination__ellipsis')).toHaveLength(2);

    (component as unknown as { selectPage: (p: number) => void }).selectPage(0);
    (component as unknown as { selectPage: (p: number) => void }).selectPage(21);
    expect(emittedPages).toEqual([]);
  });

  it('does not render pagination when totalPages is 1 or 0', async () => {
    fixture.componentRef.setInput('totalPages', 1);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('nav.product-pagination')).toBeNull();

    fixture.componentRef.setInput('totalPages', 0);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('nav.product-pagination')).toBeNull();
  });
});
