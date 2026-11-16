import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LDF_PROJECTS_SELLER } from '../../data/seller-profile.data';
import { SellerBrands } from './seller-brands';

describe('SellerBrands', () => {
  let fixture: ComponentFixture<SellerBrands>;
  let element: HTMLElement;
  let viewport: HTMLElement;
  let resize: () => void;
  const disconnect = vi.fn();
  const matchMedia = vi.fn();
  const previous = () =>
    element.querySelector<HTMLButtonElement>('[aria-label="Marcas anteriores"]')!;
  const next = () => element.querySelector<HTMLButtonElement>('[aria-label="Marcas siguientes"]')!;

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
    fixture = TestBed.createComponent(SellerBrands);
    fixture.componentRef.setInput('brands', LDF_PROJECTS_SELLER.brands);
    await fixture.whenStable();
    element = fixture.nativeElement;
    viewport = element.querySelector('ul')!;
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function dimensions(width: number, contentWidth: number, left = 0) {
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: width },
      scrollWidth: { configurable: true, value: contentWidth },
    });
    viewport.scrollLeft = left;
  }

  it('renders each brand once with accessible names and no visual captions', () => {
    const brands = LDF_PROJECTS_SELLER.brands;
    expect(new Set(brands.map((brand) => brand.id)).size).toBe(brands.length);
    const items = Array.from(element.querySelectorAll('li'));
    expect(items).toHaveLength(brands.length);
    expect(items.map((item) => item.getAttribute('aria-label'))).toEqual(
      brands.map((brand) => brand.name),
    );
    expect(items.every((item) => item.textContent?.trim() === '')).toBe(true);
    expect(Array.from(element.querySelectorAll('img')).map((img) => img.alt)).toEqual(
      brands.map((brand) => brand.name),
    );
    expect(element.querySelector('.seller-brands__name')).toBeNull();
    expect(previous().textContent?.trim()).toBe('');
    expect(next().querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('hides both controls when everything fits, including subpixel overflow', async () => {
    dimensions(300, 300.5);
    resize();
    await fixture.whenStable();
    expect(previous().hidden).toBe(true);
    expect(next().hidden).toBe(true);
  });

  it('shows only available directions at the start, middle and end without looping', async () => {
    dimensions(300, 900);
    resize();
    await fixture.whenStable();
    expect(previous().hidden).toBe(true);
    expect(next().hidden).toBe(false);
    viewport.scrollLeft = 300;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(previous().hidden).toBe(false);
    expect(next().hidden).toBe(false);
    viewport.scrollLeft = 600;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(previous().hidden).toBe(false);
    expect(next().hidden).toBe(true);
    viewport.scrollBy = vi.fn();
    next().click();
    expect(viewport.scrollBy).not.toHaveBeenCalled();
  });

  it('scrolls a visible page smoothly and respects reduced motion', async () => {
    dimensions(300, 900);
    viewport.scrollBy = vi.fn();
    resize();
    await fixture.whenStable();
    next().click();
    expect(viewport.scrollBy).toHaveBeenLastCalledWith({ left: 300, behavior: 'smooth' });
    matchMedia.mockReturnValue({ matches: true });
    next().click();
    expect(viewport.scrollBy).toHaveBeenLastCalledWith({ left: 300, behavior: 'instant' });
  });

  it('recalculates on resize, content replacement and image load and cleans up', async () => {
    dimensions(300, 900);
    resize();
    await fixture.whenStable();
    expect(next().hidden).toBe(false);
    dimensions(900, 900);
    resize();
    await fixture.whenStable();
    expect(next().hidden).toBe(true);
    dimensions(300, 900);
    element.querySelector('img')!.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(next().hidden).toBe(false);
    dimensions(300, 300);
    fixture.componentRef.setInput('brands', LDF_PROJECTS_SELLER.brands.slice(0, 1));
    await fixture.whenStable();
    expect(element.querySelectorAll('li')).toHaveLength(1);
    expect(next().hidden).toBe(true);
    const remove = vi.spyOn(viewport, 'removeEventListener');
    fixture.destroy();
    expect(disconnect).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('load', expect.any(Function), true);
  });

  it('hides broken images without introducing visible names', async () => {
    const image = element.querySelector('img')!;
    image.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(image.style.visibility).toBe('visible');
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.style.visibility).toBe('hidden');
    expect(element.querySelector('li')!.textContent?.trim()).toBe('');
    fixture.componentRef.setInput('brands', [{ id: 'example', name: 'Example' }]);
    await fixture.whenStable();
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('li')?.getAttribute('aria-label')).toBe('Example');
    expect(element.querySelector('li')?.textContent?.trim()).toBe('');
  });
});
