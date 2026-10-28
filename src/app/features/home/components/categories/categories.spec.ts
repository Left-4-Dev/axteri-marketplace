import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HOME_CATEGORIES } from '../../data/home-content.data';
import { Category } from '../../models/home-content.model';
import { Categories } from './categories';

describe('Categories', () => {
  let fixture: ComponentFixture<Categories>;
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
    await TestBed.configureTestingModule({ imports: [Categories] }).compileComponents();
    fixture = TestBed.createComponent(Categories);
    fixture.componentRef.setInput('categories', HOME_CATEGORIES);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
    viewport = element.querySelector<HTMLDivElement>('.categories__viewport')!;
    previous = element.querySelector<HTMLButtonElement>('[aria-label="Categorías anteriores"]')!;
    next = element.querySelector<HTMLButtonElement>('[aria-label="Categorías siguientes"]')!;
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  // jsdom does not lay out CSS. Model scroll boundaries, independently of card dimensions.
  async function setScrollable() {
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 900 },
    });
    Object.defineProperty(element.querySelector('ul'), 'clientWidth', {
      configurable: true,
      value: 300,
    });
    viewport.scrollBy = vi.fn((options?: ScrollToOptions | number) => {
      const delta = typeof options === 'object' ? (options.left ?? 0) : 0;
      viewport.scrollLeft = Math.max(0, Math.min(600, viewport.scrollLeft + delta));
      viewport.dispatchEvent(new Event('scroll'));
    });
    resize();
    await fixture.whenStable();
  }

  it('renders the heading and all existing typed categories in their original order', () => {
    expect(element.querySelector('h2')?.textContent).toBe('CATEGORÍAS');
    expect(fixture.componentInstance.categories()).toBe(HOME_CATEGORIES);
    expect(element.querySelectorAll('article')).toHaveLength(HOME_CATEGORIES.length);
    expect(Array.from(element.querySelectorAll('h3'), (heading) => heading.textContent)).toEqual(
      HOME_CATEGORIES.map((category) => category.name),
    );
    expect(element.querySelector('a')).toBeNull();
    expect(element.querySelector('article')?.hasAttribute('tabindex')).toBe(false);
  });

  it('uses decorative structural placeholders when images are absent', () => {
    const placeholders = element.querySelectorAll('.categories__placeholder');
    expect(placeholders).toHaveLength(HOME_CATEGORIES.length);
    placeholders.forEach((placeholder) => {
      expect(placeholder.getAttribute('aria-hidden')).toBe('true');
      expect(placeholder.textContent).toBe('');
    });
    expect(element.querySelector('img')).toBeNull();
  });

  it('renders an available image with the category name as alternative text', async () => {
    const categories: readonly Category[] = [
      { ...HOME_CATEGORIES[0], imageUrl: '/assets/category-test.jpg' },
      HOME_CATEGORIES[1],
    ];
    fixture.componentRef.setInput('categories', categories);
    await fixture.whenStable();
    const image = element.querySelector('img')!;
    expect(image.getAttribute('src')).toBe(categories[0].imageUrl);
    expect(image.alt).toBe(categories[0].name);
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(element.querySelectorAll('.categories__placeholder')).toHaveLength(1);
  });

  it('labels the section and controls, and disables navigation when everything fits', () => {
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(
      'categories-title',
    );
    expect(viewport.getAttribute('aria-labelledby')).toBe('categories-title');
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.hasAttribute('tabindex')).toBe(false);
    for (const button of [previous, next]) {
      expect(button.type).toBe('button');
      expect(button.getAttribute('aria-controls')).toBe(viewport.id);
      expect(button.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
      expect(button.disabled).toBe(true);
    }
  });

  it('pages through real content in both directions without navigating past the ends', async () => {
    await setScrollable();
    expect(viewport.tabIndex).toBe(0);
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    next.click();
    await fixture.whenStable();
    expect(viewport.scrollLeft).toBeGreaterThan(0);
    expect(previous.disabled).toBe(false);
    expect(viewport.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    next.click();
    await fixture.whenStable();
    expect(next.disabled).toBe(true);
    const end = viewport.scrollLeft;
    next.click();
    expect(viewport.scrollLeft).toBe(end);
    previous.click();
    await fixture.whenStable();
    previous.click();
    await fixture.whenStable();
    expect(viewport.scrollLeft).toBe(0);
    expect(previous.disabled).toBe(true);
  });

  it('supports keyboard navigation and respects reduced motion', async () => {
    await setScrollable();
    matchMedia.mockReturnValue({ matches: true });
    for (const key of ['ArrowRight', 'ArrowLeft']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      viewport.dispatchEvent(event);
      await fixture.whenStable();
      expect(event.defaultPrevented).toBe(true);
      expect(viewport.scrollBy).toHaveBeenLastCalledWith(
        expect.objectContaining({ behavior: 'instant' }),
      );
    }
    expect(viewport.scrollLeft).toBe(0);
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    viewport.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('updates controls after touch/native scrolling and responsive resizing', async () => {
    await setScrollable();
    viewport.scrollLeft = 600;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(next.disabled).toBe(true);
    expect(previous.disabled).toBe(false);
    Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 900 });
    viewport.scrollLeft = 0;
    resize();
    await fixture.whenStable();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(true);
    expect(viewport.hasAttribute('tabindex')).toBe(false);
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('updates replaced or empty input data without creating extra categories', async () => {
    fixture.componentRef.setInput('categories', HOME_CATEGORIES.slice(0, 2));
    await fixture.whenStable();
    expect(element.querySelectorAll('article')).toHaveLength(2);
    fixture.componentRef.setInput('categories', []);
    await fixture.whenStable();
    expect(element.querySelector('article')).toBeNull();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(true);
  });
});
