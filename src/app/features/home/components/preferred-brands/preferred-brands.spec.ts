import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HOME_BRANDS } from '../../data/home-content.data';
import { PreferredBrands } from './preferred-brands';

describe('PreferredBrands', () => {
  let fixture: ComponentFixture<PreferredBrands>;
  let element: HTMLElement;
  let resize: () => void;
  const disconnect = vi.fn();
  const observe = vi.fn();
  const matchMedia = vi.fn();

  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    matchMedia.mockReturnValue({ matches: false });
    vi.stubGlobal('matchMedia', matchMedia);
    await TestBed.configureTestingModule({ imports: [PreferredBrands] }).compileComponents();
    fixture = TestBed.createComponent(PreferredBrands);
    fixture.componentRef.setInput('brands', HOME_BRANDS);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function viewport(id: string): HTMLDivElement {
    return element.querySelector<HTMLDivElement>(`[data-brand-id="${id}"]`)!;
  }

  // jsdom does not lay out chips; simulate overflow without asserting CSS dimensions.
  async function setScrollable(target: HTMLDivElement) {
    Object.defineProperties(target, {
      clientWidth: { configurable: true, value: 200 },
      scrollWidth: { configurable: true, value: 600 },
    });
    const scroll = (left: number) => (target.scrollLeft = Math.max(0, Math.min(400, left)));
    target.scrollBy = vi.fn((options?: ScrollToOptions | number) =>
      scroll(target.scrollLeft + (typeof options === 'object' ? (options.left ?? 0) : 0)),
    );
    target.scrollTo = vi.fn((options?: ScrollToOptions | number) =>
      scroll(typeof options === 'object' ? (options.left ?? 0) : 0),
    );
    resize();
    await fixture.whenStable();
  }

  function key(target: HTMLElement, key: string, options: KeyboardEventInit = {}) {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    target.dispatchEvent(event);
    return event;
  }

  it('renders a named section and all received brands in order', () => {
    const section = element.querySelector('section')!;
    const heading = element.querySelector('h2')!;
    expect(heading.textContent).toBe('LAS MARCAS PREFERIDAS');
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
    expect([...element.querySelectorAll('h3')].map((h) => h.textContent?.trim())).toEqual(
      HOME_BRANDS.map((brand) => brand.name),
    );
    expect(element.querySelector('app-product-card')).toBeNull();
  });

  it.each(HOME_BRANDS)(
    'renders $name categories, four previews and its unavailable CTA',
    (brand) => {
      const article = viewport(brand.id).closest('article')!;
      expect(article.getAttribute('aria-labelledby')).toBe(article.querySelector('h3')!.id);
      expect(viewport(brand.id).getAttribute('aria-label')).toBe(`Categorías de ${brand.name}`);
      expect(
        [...article.querySelectorAll('.preferred-brands__category')].map((c) =>
          c.textContent?.trim(),
        ),
      ).toEqual(brand.categories);
      const previews = article.querySelectorAll('.preferred-brands__image');
      expect(previews).toHaveLength(4);
      previews.forEach((preview, index) => {
        expect(preview.querySelector('img')).toBeNull();
        expect(preview.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
          `Imagen del producto ${index + 1} de ${brand.name} pendiente`,
        );
      });
      const cta = article.querySelector('button')!;
      expect(cta.textContent?.trim()).toBe('VER MÁS PRODUCTOS');
      expect(cta.disabled).toBe(true);
      expect(
        element.querySelector(`#${cta.getAttribute('aria-describedby')}`)?.textContent,
      ).toContain('aún no está disponible');
      expect(article.querySelector('a')).toBeNull();
    },
  );

  it('renders provided images with an alt and preserves placeholders for other previews', async () => {
    fixture.componentRef.setInput('brands', [
      {
        ...HOME_BRANDS[0],
        previews: [
          { id: 'image-preview', imageUrl: '/assets/product-test.webp' },
          { id: 'pending-preview' },
        ],
      },
    ]);
    await fixture.whenStable();
    const image = element.querySelector('img')!;
    expect(image.getAttribute('src')).toBe('/assets/product-test.webp');
    expect(image.alt).toBe('Producto 1 de Siemens');
    expect(element.querySelectorAll('.preferred-brands__image')).toHaveLength(2);
    expect(element.querySelectorAll('.preferred-brands__placeholder')).toHaveLength(1);
  });

  it('handles an empty list without cards or controls', async () => {
    fixture.componentRef.setInput('brands', []);
    await fixture.whenStable();
    expect(element.querySelector('article, button, [tabindex]')).toBeNull();
    expect(element.textContent).toContain('No hay marcas preferidas disponibles.');
  });

  it('only adds keyboard focus to viewports with actual overflow and reacts to resize', async () => {
    const siemens = viewport('siemens');
    expect(element.querySelector('[tabindex]')).toBeNull();
    await setScrollable(siemens);
    expect(siemens.tabIndex).toBe(0);
    expect(viewport('abb').hasAttribute('tabindex')).toBe(false);
    expect(viewport('omron').hasAttribute('tabindex')).toBe(false);
    Object.defineProperty(siemens, 'clientWidth', { configurable: true, value: 600 });
    resize();
    await fixture.whenStable();
    expect(siemens.hasAttribute('tabindex')).toBe(false);
    expect(key(siemens, 'ArrowRight').defaultPrevented).toBe(false);
  });

  it.each(HOME_BRANDS)('supports arrows and Home/End independently for $name', async (brand) => {
    const target = viewport(brand.id);
    await setScrollable(target);
    expect(key(target, 'ArrowRight').defaultPrevented).toBe(true);
    expect(target.scrollLeft).toBeGreaterThan(0);
    expect(target.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    key(target, 'ArrowLeft');
    expect(target.scrollLeft).toBe(0);
    matchMedia.mockReturnValue({ matches: true });
    key(target, 'End');
    expect(target.scrollLeft).toBe(400);
    expect(target.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'instant' }));
    key(target, 'Home');
    expect(target.scrollLeft).toBe(0);
    for (const other of HOME_BRANDS.filter((b) => b.id !== brand.id)) {
      expect(viewport(other.id).scrollLeft).toBe(0);
    }
  });

  it('does not intercept Tab, modified shortcuts or events from children', async () => {
    const target = viewport('siemens');
    await setScrollable(target);
    for (const modifier of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey']) {
      expect(key(target, 'ArrowRight', { [modifier]: true }).defaultPrevented).toBe(false);
    }
    expect(key(target, 'Tab').defaultPrevented).toBe(false);
    const button = document.createElement('button');
    target.append(button);
    expect(key(button, 'End').defaultPrevented).toBe(false);
    expect(target.scrollBy).not.toHaveBeenCalled();
    expect(target.scrollTo).not.toHaveBeenCalled();
  });

  it('reobserves replacement content and cleans up on destruction', async () => {
    await setScrollable(viewport('siemens'));
    const previousDisconnects = disconnect.mock.calls.length;
    fixture.componentRef.setInput('brands', [HOME_BRANDS[2]]);
    await fixture.whenStable();
    expect(disconnect.mock.calls.length).toBeGreaterThan(previousDisconnects);
    expect(element.querySelectorAll('article')).toHaveLength(1);
    expect(observe).toHaveBeenCalledWith(viewport('omron'));
    expect(observe).toHaveBeenCalledWith(viewport('omron').firstElementChild);
    const beforeDestroy = disconnect.mock.calls.length;
    fixture.destroy();
    expect(disconnect.mock.calls.length).toBe(beforeDestroy + 1);
  });
});
