import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header, PRODUCTS_MENU_CLOSE_DELAY, PRODUCTS_MENU_MEDIA_QUERY } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let element: HTMLElement;
  let desktopMedia: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.stubGlobal('scrollY', 0);
    desktopMedia = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal(
      'matchMedia',
      vi
        .fn()
        .mockImplementation((query: string) =>
          query === PRODUCTS_MENU_MEDIA_QUERY ? desktopMedia : { matches: false },
        ),
    );
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Header);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function scrollTo(y: number): Promise<void> {
    vi.stubGlobal('scrollY', y);
    window.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
  }

  it('keeps a single navbar and reveals its input only above 48px', async () => {
    const navbar = element.querySelector('.header__navbar');
    const input = element.querySelector<HTMLInputElement>('.header__search-input')!;
    expect(input.hidden).toBe(true);
    await scrollTo(48);
    expect(input.hidden).toBe(true);
    await scrollTo(49);
    expect(input.hidden).toBe(false);
    expect(element.querySelector('.header__navbar')).toBe(navbar);

    input.focus();
    await scrollTo(0);
    expect(input.hidden).toBe(true);
    expect(document.activeElement).toBe(element.querySelector('.header__search-button'));
  });

  it('requests the primary search after the scoped bounce ends', async () => {
    const requested = vi.fn();
    fixture.componentInstance.primarySearchRequested.subscribe(requested);
    const button = element.querySelector<HTMLButtonElement>('.header__search-button')!;
    button.click();
    await fixture.whenStable();
    expect(requested).not.toHaveBeenCalled();
    expect(button.classList.contains('header__search-button--attention')).toBe(true);

    button.dispatchEvent(
      Object.assign(new Event('animationend'), {
        animationName: '_ngcontent-test_header-search-bounce',
      }),
    );
    await fixture.whenStable();
    expect(requested).toHaveBeenCalledTimes(1);
    expect(button.classList.contains('header__search-button--attention')).toBe(false);
  });

  it('requests focus immediately with reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const requested = vi.fn();
    fixture.componentInstance.primarySearchRequested.subscribe(requested);
    const button = element.querySelector<HTMLButtonElement>('.header__search-button')!;
    button.click();
    await fixture.whenStable();
    expect(requested).toHaveBeenCalledTimes(1);
    expect(button.classList.contains('header__search-button--attention')).toBe(false);
  });

  it('focuses its own input when scrolled without triggering the Hero', async () => {
    const requested = vi.fn();
    fixture.componentInstance.primarySearchRequested.subscribe(requested);
    await scrollTo(200);
    element.querySelector<HTMLButtonElement>('.header__search-button')!.click();
    expect(document.activeElement).toBe(element.querySelector('.header__search-input'));
    expect(requested).not.toHaveBeenCalled();
  });

  it('removes its scroll listener when destroyed', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    fixture.destroy();
    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(desktopMedia.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  function productsTrigger(): HTMLAnchorElement {
    return element.querySelector<HTMLAnchorElement>('#header-products-trigger')!;
  }

  function productsPanel(): HTMLElement {
    return element.querySelector<HTMLElement>('#header-products-menu')!;
  }

  async function openProducts(): Promise<void> {
    productsTrigger().dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
  }

  it('keeps the navigation link and exposes the controlled panel on hover', async () => {
    expect(productsPanel().hidden).toBe(true);
    expect(productsTrigger().getAttribute('aria-expanded')).toBe('false');
    expect(productsTrigger().getAttribute('href')).toBe('/#featured-products');
    await openProducts();
    expect(productsPanel().hidden).toBe(false);
    expect(productsTrigger().getAttribute('aria-expanded')).toBe('true');
    expect(productsTrigger().getAttribute('aria-controls')).toBe(productsPanel().id);
  });

  it('allows crossing from the trigger to the panel and closes after leaving both', async () => {
    await openProducts();
    productsTrigger().dispatchEvent(new Event('pointerleave'));
    productsPanel().dispatchEvent(new Event('pointerenter'));
    await new Promise((resolve) => setTimeout(resolve, PRODUCTS_MENU_CLOSE_DELAY + 30));
    await fixture.whenStable();
    expect(productsPanel().hidden).toBe(false);
    productsPanel().dispatchEvent(new Event('pointerleave'));
    await new Promise((resolve) => setTimeout(resolve, PRODUCTS_MENU_CLOSE_DELAY + 30));
    await fixture.whenStable();
    expect(productsPanel().hidden).toBe(true);
  });

  it('supports focus entry, Escape restoration, and reopening with ArrowDown', async () => {
    productsTrigger().focus();
    await fixture.whenStable();
    productsTrigger().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await fixture.whenStable();
    expect(document.activeElement?.getAttribute('role')).toBe('tab');
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();
    expect(productsPanel().hidden).toBe(true);
    expect(document.activeElement).toBe(productsTrigger());
    productsTrigger().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await fixture.whenStable();
    expect(productsPanel().hidden).toBe(false);
    expect(document.activeElement?.getAttribute('role')).toBe('tab');
  });

  it('closes when keyboard focus moves to the next navigation link', async () => {
    productsTrigger().focus();
    await fixture.whenStable();
    element.querySelector<HTMLAnchorElement>('a[href="/#limited-offers"]')!.focus();
    await fixture.whenStable();
    expect(productsPanel().hidden).toBe(true);
    expect(document.activeElement?.getAttribute('href')).toBe('/#limited-offers');
  });

  it('closes on significant scroll, including the initial/scrolled boundary', async () => {
    await openProducts();
    await scrollTo(4);
    expect(productsPanel().hidden).toBe(false);
    await scrollTo(8);
    expect(productsPanel().hidden).toBe(true);
    await scrollTo(48);
    await openProducts();
    await scrollTo(49);
    expect(productsPanel().hidden).toBe(true);
    await openProducts();
    expect(productsPanel().hidden).toBe(false);
    expect(element.querySelector('.header--scrolled')).not.toBeNull();
  });

  it('dismisses on outside pointer and viewport resize', async () => {
    await openProducts();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(productsPanel().hidden).toBe(true);
    await openProducts();
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();
    expect(productsPanel().hidden).toBe(true);
  });

  it('does not expose desktop disclosure below the official xl breakpoint', async () => {
    await openProducts();
    desktopMedia.matches = false;
    desktopMedia.addEventListener.mock.calls[0][1]();
    await fixture.whenStable();
    expect(productsPanel().hidden).toBe(true);
    expect(productsTrigger().hasAttribute('aria-expanded')).toBe(false);
    await openProducts();
    expect(productsPanel().hidden).toBe(true);
  });
});
