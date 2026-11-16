import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellerCertifications } from './seller-certifications';
import { LDF_PROJECTS_SELLER } from '../../data/seller-profile.data';

describe('SellerCertifications', () => {
  let fixture: ComponentFixture<SellerCertifications>;
  let element: HTMLElement;
  let viewport: HTMLElement;
  let resize: () => void;
  const buttons = () => [...element.querySelectorAll('button')];
  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    fixture = TestBed.createComponent(SellerCertifications);
    fixture.componentRef.setInput('certifications', LDF_PROJECTS_SELLER.certifications);
    await fixture.whenStable();
    element = fixture.nativeElement;
    viewport = element.querySelector('ul')!;
  });
  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
  });

  it('renders each certification once from the input with image and name', () => {
    const data = LDF_PROJECTS_SELLER.certifications;
    expect(element.querySelectorAll('li')).toHaveLength(data.length);
    expect([...element.querySelectorAll('li p')].map((p) => p.textContent)).toEqual(
      data.map((c) => c.name),
    );
    expect([...element.querySelectorAll('img')].map((img) => img.getAttribute('src'))).toEqual(
      data.map((c) => c.image),
    );
  });
  it('shows a clean fallback for broken or absent images', async () => {
    const image = element.querySelector('img')!;
    image.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(
      element.querySelector('li')!.querySelector('.seller-certifications__fallback'),
    ).toBeNull();
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.style.visibility).toBe('hidden');
    expect(element.querySelector('li')!.textContent).toContain('Imagen no disponible');
    fixture.componentRef.setInput('certifications', [{ id: 'missing', name: 'Certificado' }]);
    await fixture.whenStable();
    expect(element.querySelector('img')).toBeNull();
    expect(element.textContent).toContain('Imagen no disponible');
  });
  it('shows only available directions for fitting, start, middle and end states', async () => {
    Object.defineProperties(viewport, {
      clientWidth: { value: 300, configurable: true },
      scrollWidth: { value: 300, configurable: true },
    });
    resize();
    await fixture.whenStable();
    expect(buttons().map((b) => b.hidden)).toEqual([true, true]);
    Object.defineProperty(viewport, 'scrollWidth', { value: 900 });
    resize();
    await fixture.whenStable();
    expect(buttons().map((b) => b.hidden)).toEqual([true, false]);
    viewport.scrollLeft = 300;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(buttons().map((b) => b.hidden)).toEqual([false, false]);
    viewport.scrollLeft = 600;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(buttons().map((b) => b.hidden)).toEqual([false, true]);
    viewport.scrollTo = vi.fn();
    buttons()[1].click();
    expect(viewport.scrollTo).not.toHaveBeenCalled();
  });
});
