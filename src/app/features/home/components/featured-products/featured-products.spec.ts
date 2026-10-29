import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';
import { FEATURED_PRODUCTS } from '../../data/home-products.data';
import { FeaturedProducts } from './featured-products';

describe('FeaturedProducts', () => {
  let fixture: ComponentFixture<FeaturedProducts>;
  let element: HTMLElement;
  let viewport: HTMLDivElement;
  let previous: HTMLButtonElement;
  let next: HTMLButtonElement;
  let resize: () => void;
  const disconnect = vi.fn();
  const matchMedia = vi.fn();

  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
    matchMedia.mockReturnValue({ matches: false });
    vi.stubGlobal('matchMedia', matchMedia);
    await TestBed.configureTestingModule({ imports: [FeaturedProducts] }).compileComponents();
    fixture = TestBed.createComponent(FeaturedProducts);
    fixture.componentRef.setInput('products', FEATURED_PRODUCTS);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
    viewport = element.querySelector<HTMLDivElement>('.featured-products__viewport')!;
    previous = element.querySelector<HTMLButtonElement>(
      '[aria-label="Productos destacados anteriores"]',
    )!;
    next = element.querySelector<HTMLButtonElement>(
      '[aria-label="Productos destacados siguientes"]',
    )!;
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  // jsdom has no layout; supply a scrollable viewport without coupling tests to CSS sizes.
  async function setScrollable() {
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 900 },
    });
    vi.spyOn(viewport.querySelector('li')!, 'getBoundingClientRect').mockReturnValue({
      width: 250,
    } as DOMRect);
    const scroll = (left: number) => {
      viewport.scrollLeft = Math.max(0, Math.min(600, left));
      viewport.dispatchEvent(new Event('scroll'));
    };
    viewport.scrollBy = vi.fn((options?: ScrollToOptions | number) =>
      scroll(viewport.scrollLeft + (typeof options === 'object' ? (options.left ?? 0) : 0)),
    );
    viewport.scrollTo = vi.fn((options?: ScrollToOptions | number) =>
      scroll(typeof options === 'object' ? (options.left ?? 0) : 0),
    );
    resize();
    await fixture.whenStable();
  }

  function key(key: string) {
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  it('renders the heading and existing products through the shared default variant', () => {
    expect(element.querySelector('h2')?.textContent).toBe('PRODUCTOS DESTACADOS');
    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards).toHaveLength(FEATURED_PRODUCTS.length);
    cards.forEach((card, index) => {
      const instance = card.componentInstance as ProductCard;
      expect(instance.product()).toBe(FEATURED_PRODUCTS[index]);
      expect(instance.variant()).toBe('default');
    });
    expect(element.querySelectorAll('.product-card__discount')).toHaveLength(2);
    expect(element.textContent).toContain('S/ 4,500.00');
  });

  it('labels the carousel and disables navigation when everything fits', () => {
    expect(viewport.hasAttribute('tabindex')).toBe(false);
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-labelledby')).toBe('featured-products-title');
    expect(viewport.getAttribute('aria-roledescription')).toBe('carrusel');
    for (const button of [previous, next]) {
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('aria-controls')).toBe(viewport.id);
      expect(button.disabled).toBe(true);
    }
    expect(element.querySelector('a')).toBeNull();
  });

  it('moves forward and backward and updates arrow availability from actual scroll position', async () => {
    await setScrollable();
    expect(viewport.tabIndex).toBe(0);
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    next.click();
    await fixture.whenStable();
    expect(viewport.scrollLeft).toBeGreaterThan(0);
    expect(previous.disabled).toBe(false);
    expect(viewport.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    previous.click();
    await fixture.whenStable();
    expect(viewport.scrollLeft).toBe(0);
    expect(previous.disabled).toBe(true);
  });

  it('supports arrows, Home and End with reduced-motion scrolling', async () => {
    await setScrollable();
    matchMedia.mockReturnValue({ matches: true });
    key('ArrowRight');
    await fixture.whenStable();
    expect(viewport.scrollLeft).toBeGreaterThan(0);
    expect(viewport.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'instant' }),
    );
    key('ArrowLeft');
    await fixture.whenStable();
    expect(previous.disabled).toBe(true);
    key('End');
    await fixture.whenStable();
    expect(next.disabled).toBe(true);
    expect(previous.disabled).toBe(false);
    const end = viewport.scrollLeft;
    next.click();
    key('ArrowRight');
    expect(viewport.scrollLeft).toBe(end);
    expect(viewport.scrollTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ behavior: 'instant' }),
    );
    key('Home');
    await fixture.whenStable();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
  });

  it('updates on native scroll and resize, and disconnects its observer', async () => {
    await setScrollable();
    viewport.scrollLeft = 600;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(next.disabled).toBe(true);
    Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 900 });
    viewport.scrollLeft = 0;
    resize();
    await fixture.whenStable();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(true);
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('handles an empty product list without enabling navigation', async () => {
    fixture.componentRef.setInput('products', []);
    await fixture.whenStable();
    expect(element.querySelector('app-product-card')).toBeNull();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(true);
    expect(viewport.hasAttribute('tabindex')).toBe(false);
    expect(element.textContent).toContain('No hay productos destacados disponibles.');
  });

  it('does not intercept child actions, modified shortcuts or Tab', async () => {
    await setScrollable();
    const action = element.querySelector<HTMLButtonElement>('.product-card__actions button')!;
    const events = [
      { target: action, options: { key: 'ArrowRight' } },
      { target: viewport, options: { key: 'ArrowRight', altKey: true } },
      { target: viewport, options: { key: 'Home', ctrlKey: true } },
      { target: viewport, options: { key: 'End', metaKey: true } },
      { target: viewport, options: { key: 'Tab' } },
    ];
    for (const { target, options } of events) {
      const event = new KeyboardEvent('keydown', { ...options, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(viewport.scrollBy).not.toHaveBeenCalled();
    expect(viewport.scrollTo).not.toHaveBeenCalled();
  });

  it('renders replacement inputs in order without duplicating products', async () => {
    fixture.componentRef.setInput('products', FEATURED_PRODUCTS.slice(2, 4));
    await fixture.whenStable();
    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards.map((card) => (card.componentInstance as ProductCard).product())).toEqual(
      FEATURED_PRODUCTS.slice(2, 4),
    );
    expect(element.querySelectorAll('.product-card__placeholder')).toHaveLength(2);
  });
});
