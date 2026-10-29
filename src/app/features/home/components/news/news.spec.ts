import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HOME_NEWS } from '../../data/home-content.data';
import { NewsItem } from '../../models/home-content.model';
import { News } from './news';

describe('News', () => {
  let fixture: ComponentFixture<News>;
  let element: HTMLElement;
  let resize: () => void;
  const disconnect = vi.fn();
  const matchMedia = vi.fn();
  // Extra slides are test inputs only, not new commercial news in Home.
  const items: readonly NewsItem[] = Array.from({ length: 3 }, (_, index) => ({
    id: `test-${index}`,
    alt: `Pieza de prueba ${index + 1}`,
  }));
  const track = () => element.querySelector<HTMLDivElement>('.news__track')!;
  const dots = () => [...element.querySelectorAll<HTMLButtonElement>('.news__dot')];
  const activeDot = () => dots().findIndex((dot) => dot.getAttribute('aria-current') === 'true');

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
    await TestBed.configureTestingModule({
      imports: [News],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(News);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  async function setItems(value: readonly NewsItem[]) {
    fixture.componentRef.setInput('items', value);
    await fixture.whenStable();
  }

  async function setScrollable() {
    const viewport = track();
    Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 300 });
    viewport.scrollTo = vi.fn((options?: ScrollToOptions | number) => {
      viewport.scrollLeft = typeof options === 'object' ? (options.left ?? 0) : 0;
      viewport.dispatchEvent(new Event('scroll'));
    });
    resize();
    await fixture.whenStable();
  }

  function key(key: string, options: KeyboardEventInit = {}, target: HTMLElement = track()) {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    target.dispatchEvent(event);
    return event;
  }

  it('renders the named section and one slide per received news item', () => {
    const heading = element.querySelector('h2')!;
    expect(heading.textContent).toBe('NOTICIAS');
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(heading.id);
    const slides = [...element.querySelectorAll('.news__slide')];
    expect(slides).toHaveLength(items.length);
    slides.forEach((slide, index) => {
      expect(slide.id).toBe(`news-slide-${items[index].id}`);
      expect(slide.getAttribute('aria-label')).toBe(`Noticia ${index + 1} de 3`);
    });
    expect(element.querySelector('app-product-card, h3, dl')).toBeNull();
  });

  it('shows a descriptive placeholder when the complete artwork is pending', async () => {
    await setItems(HOME_NEWS);
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      `${HOME_NEWS[0].alt}: banner pendiente`,
    );
    expect(element.textContent).toContain('Banner de noticia pendiente');
    expect(element.querySelector('.news__cta')).toBeNull();
  });

  it('renders the existing category as a real badge inside the notch', async () => {
    await setItems(HOME_NEWS);
    expect(element.querySelector('.news__notch .news__badge')?.textContent).toBe(
      HOME_NEWS[0].badge,
    );
    expect(element.querySelector('.news__media .news__badge')).toBeNull();
  });

  it('omits the notch when no badge or only whitespace is supplied', async () => {
    expect(element.querySelector('.news__notch')).toBeNull();
    await setItems([{ ...items[0], badge: ' ' }]);
    expect(element.querySelector('.news__notch')).toBeNull();
  });

  it('renders the supplied desktop image with its real alt and optional mobile source', async () => {
    await setItems([
      {
        ...items[0],
        imageUrl: '/assets/test-desktop.png',
        mobileImageUrl: '/assets/test-mobile.png',
      },
    ]);
    const image = element.querySelector('picture img')!;
    expect(image.getAttribute('src')).toBe('/assets/test-desktop.png');
    expect(image.getAttribute('alt')).toBe(items[0].alt);
    const source = element.querySelector('picture source')!;
    expect(source.getAttribute('srcset')).toBe('/assets/test-mobile.png');
    expect(source.getAttribute('media')).toBe('(max-width: 48rem)');
  });

  it('uses the desktop artwork alone when there is no mobile source', async () => {
    await setItems([{ ...items[0], imageUrl: '/assets/test-desktop.png' }]);
    expect(element.querySelector('picture img')).not.toBeNull();
    expect(element.querySelector('source')).toBeNull();
  });

  it('derives accessible dots from the item count and identifies the active slide', () => {
    expect(dots()).toHaveLength(items.length);
    expect(activeDot()).toBe(0);
    dots().forEach((dot, index) => {
      expect(dot.type).toBe('button');
      expect(dot.getAttribute('aria-label')).toBe(`Ir a la noticia ${index + 1}`);
      expect(dot.getAttribute('aria-controls')).toBe(`news-slide-${items[index].id}`);
      expect(dot.textContent?.trim()).toBe('');
    });
    expect(track().tabIndex).toBe(0);
    expect(track().getAttribute('aria-roledescription')).toBe('carrusel');
  });

  it('navigates directly with dots and updates the active indicator from scrolling', async () => {
    await setScrollable();
    dots()[2].click();
    await fixture.whenStable();
    expect(track().scrollTo).toHaveBeenCalledWith({ left: 600, behavior: 'smooth' });
    expect(activeDot()).toBe(2);
    expect(element.querySelector('.news__status')?.textContent).toContain('Noticia 3 de 3');
    const slides = [...element.querySelectorAll('.news__slide')];
    expect(slides[0].hasAttribute('inert')).toBe(true);
    expect(slides[2].hasAttribute('inert')).toBe(false);
    expect(slides[2].getAttribute('aria-hidden')).toBeNull();
  });

  it('updates pagination after native scrolling such as a touch swipe', async () => {
    await setScrollable();
    track().scrollLeft = 300;
    track().dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(activeDot()).toBe(1);
  });

  it('supports ArrowLeft, ArrowRight, Home and End with reduced motion and bounded navigation', async () => {
    await setScrollable();
    matchMedia.mockReturnValue({ matches: true });
    expect(key('ArrowRight').defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(activeDot()).toBe(1);
    expect(track().scrollTo).toHaveBeenLastCalledWith({ left: 300, behavior: 'instant' });
    key('ArrowLeft');
    await fixture.whenStable();
    expect(activeDot()).toBe(0);
    key('End');
    await fixture.whenStable();
    expect(activeDot()).toBe(2);
    key('ArrowRight');
    await fixture.whenStable();
    expect(activeDot()).toBe(2);
    key('Home');
    await fixture.whenStable();
    expect(activeDot()).toBe(0);
    key('ArrowLeft');
    await fixture.whenStable();
    expect(activeDot()).toBe(0);
  });

  it('does not intercept Tab, modifier shortcuts or keyboard events from children', async () => {
    await setItems([{ ...items[0], cta: { label: 'Inicio', destination: '/' } }, items[1]]);
    await setScrollable();
    expect(key('Tab').defaultPrevented).toBe(false);
    for (const modifier of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey']) {
      expect(key('ArrowRight', { [modifier]: true }).defaultPrevented).toBe(false);
    }
    expect(
      key('ArrowRight', {}, element.querySelector('.news__cta button')!).defaultPrevented,
    ).toBe(false);
    expect(track().scrollTo).not.toHaveBeenCalled();
  });

  it('keeps the active slide aligned on resize and disconnects its observer on destroy', async () => {
    await setScrollable();
    dots()[1].click();
    await fixture.whenStable();
    Object.defineProperty(track(), 'clientWidth', { configurable: true, value: 500 });
    resize();
    expect(track().scrollLeft).toBe(500);
    expect(activeDot()).toBe(1);
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('renders a single banner without pagination or an unnecessary focus stop', async () => {
    await setItems([items[0]]);
    expect(element.querySelectorAll('.news__slide')).toHaveLength(1);
    expect(element.querySelector('.news__pagination, button')).toBeNull();
    expect(track().hasAttribute('tabindex')).toBe(false);
    expect(track().hasAttribute('aria-roledescription')).toBe(false);
  });

  it('omits the section for an empty list and handles later replacement inputs', async () => {
    await setScrollable();
    dots()[2].click();
    await fixture.whenStable();
    await setItems([]);
    expect(element.querySelector('section')).toBeNull();
    await setItems(items.slice(0, 2));
    expect(element.querySelectorAll('.news__slide')).toHaveLength(2);
    expect(dots()).toHaveLength(2);
    expect(activeDot()).toBe(0);
    expect(track().scrollLeft).toBe(0);
  });

  it('renders the shared CTA only with valid metadata and navigates to the supplied destination', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await setItems([
      { ...items[0], cta: { label: 'Inicio', destination: '/' } },
      { ...items[1], cta: { label: ' ', destination: '/' } },
      { ...items[2], cta: { label: 'Destino pendiente', destination: ' ' } },
    ]);
    const buttons = element.querySelectorAll<HTMLButtonElement>('.news__cta app-button button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent?.trim()).toBe('Inicio');
    expect(buttons[0].type).toBe('button');
    expect(buttons[0].closest('.news__slide')?.id).toBe('news-slide-test-0');
    buttons[0].click();
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/');
  });

  it('does not invent CTAs when no destination has been provided', () => {
    expect(element.querySelector('a, .news__cta, app-button')).toBeNull();
    expect(element.textContent).not.toContain('SOLICITAR COTIZACIÓN');
  });
});
