import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';
import { LIMITED_OFFERS } from '../../data/home-products.data';
import { LimitedOffers } from './limited-offers';

describe('LimitedOffers', () => {
  let fixture: ComponentFixture<LimitedOffers>;
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
    await TestBed.configureTestingModule({ imports: [LimitedOffers] }).compileComponents();
    fixture = TestBed.createComponent(LimitedOffers);
    fixture.componentRef.setInput('products', LIMITED_OFFERS);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
    viewport = element.querySelector<HTMLDivElement>('.limited-offers__viewport')!;
    previous = element.querySelector<HTMLButtonElement>('[aria-label="Ofertas anteriores"]')!;
    next = element.querySelector<HTMLButtonElement>('[aria-label="Ofertas siguientes"]')!;
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

  it('renders the heading and existing products through the shared offer variant', () => {
    expect(element.querySelector('h2')?.textContent).toBe('OFERTA POR TIEMPO LIMITADO');
    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards).toHaveLength(LIMITED_OFFERS.length);
    cards.forEach((card, index) => {
      const instance = card.componentInstance as ProductCard;
      expect(instance.product()).toBe(LIMITED_OFFERS[index]);
      expect(instance.variant()).toBe('offer');
    });
    expect(element.querySelectorAll('.product-card__discount')).toHaveLength(LIMITED_OFFERS.length);
    expect(element.textContent).toContain('S/ 1,850.00');
  });

  it('labels the keyboard-accessible carousel and omits the CTA without a catalog destination', () => {
    expect(viewport.tabIndex).toBe(0);
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Productos en oferta');
    for (const button of [previous, next]) {
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('aria-controls')).toBe(viewport.id);
      expect(button.disabled).toBe(true);
    }
    expect(element.querySelector('.limited-offers__more, section > button')).toBeNull();
    expect(element.textContent).not.toContain('MÁS OFERTAS');
    expect(element.querySelector('a')).toBeNull();
  });

  it('keeps all ten offers in the carousel without a CTA, regardless of viewport overflow', async () => {
    const products = Array.from({ length: 10 }, (_, index) => ({
      ...LIMITED_OFFERS[index % LIMITED_OFFERS.length],
      id: `offer-test-${index}`,
    }));
    fixture.componentRef.setInput('products', products);
    await fixture.whenStable();
    await setScrollable();

    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards.map((card) => (card.componentInstance as ProductCard).product())).toEqual(
      products,
    );
    expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
    expect(next.disabled).toBe(false);
    expect(element.querySelector('.limited-offers__more, section > button, a')).toBeNull();

    next.click();
    await fixture.whenStable();
    expect(viewport.scrollLeft).toBeGreaterThan(0);
    key('End');
    await fixture.whenStable();
    expect(viewport.scrollLeft).toBe(viewport.scrollWidth - viewport.clientWidth);
    expect(next.disabled).toBe(true);
    expect(viewport.querySelectorAll('app-product-card')).toHaveLength(10);
    expect(element.querySelector('.limited-offers__more, section > button, a')).toBeNull();

    Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 900 });
    viewport.scrollLeft = 0;
    resize();
    await fixture.whenStable();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(true);
    expect(element.querySelector('.limited-offers__more, section > button, a')).toBeNull();
  });

  it('moves forward and backward and updates arrow availability from actual scroll position', async () => {
    await setScrollable();
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
  });
});
