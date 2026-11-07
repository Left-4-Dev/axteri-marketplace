import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../../app.routes';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';

describe('ProductDetailPage', () => {
  let harness: RouterTestingHarness;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
    harness = await RouterTestingHarness.create('/productos/weg-w22-3kw');
    element = harness.routeNativeElement!;
  });

  it('loads the lazy detail route inside the global layout', () => {
    expect(element.querySelector('app-header')).not.toBeNull();
    expect(element.querySelector('app-footer')).not.toBeNull();
    expect(element.querySelector('app-floating-actions')).not.toBeNull();
    expect(element.querySelector('app-product-detail-page h1')?.textContent).toBe(
      W22_PRODUCT_DETAIL.name,
    );
  });

  it('renders a breadcrumb with working parent links and the current product', () => {
    const breadcrumb = element.querySelector('nav[aria-label="Breadcrumb"]')!;
    expect(breadcrumb.querySelector('ol')).not.toBeNull();
    expect(
      Array.from(breadcrumb.querySelectorAll('a')).map((link) => link.getAttribute('href')),
    ).toEqual(['/', '/productos']);
    expect(breadcrumb.querySelector('[aria-current="page"]')?.textContent).toContain(
      W22_PRODUCT_DETAIL.name,
    );
  });

  it('renders price, seller, highlights and the gallery from the typed mock', () => {
    expect(element.querySelector('.purchase-panel__price')?.textContent).toContain('S/ 4,000.00');
    expect(element.querySelector('.purchase-panel__seller')?.textContent).toContain('LDF Projects');
    expect(element.querySelector('.purchase-panel__verified')?.textContent).toContain(
      'Proveedor verificado',
    );
    for (const highlight of W22_PRODUCT_DETAIL.highlights) {
      expect(element.querySelector('.product-summary__highlights')?.textContent).toContain(
        highlight.value,
      );
    }
    expect(element.querySelectorAll('.product-gallery__thumbnails button')).toHaveLength(3);
    expect(element.querySelector('.product-gallery__image')?.getAttribute('alt')).toBe(
      W22_PRODUCT_DETAIL.images[0].alt,
    );
  });

  it('shows both CTAs and acknowledges intent without claiming to send a request', async () => {
    const buttons = element.querySelectorAll<HTMLButtonElement>('.purchase-panel__actions button');
    expect(buttons[0].textContent).toContain('Contactar proveedor');
    expect(buttons[1].textContent).toContain('Solicitar cotización');
    buttons[1].click();
    await harness.fixture.whenStable();
    expect(element.querySelector('.product-detail__status')?.textContent).toContain(
      'No se ha enviado ninguna solicitud',
    );
  });

  it('reacts to route parameter changes and handles an unknown product', async () => {
    await harness.navigateByUrl('/productos/no-existe');
    expect(element.querySelector('app-product-detail-page h1')?.textContent).toBe(
      'Producto no encontrado',
    );
    expect(element.querySelector('app-product-purchase-panel')).toBeNull();
    expect(element.querySelector('app-product-recommendations')).toBeNull();
    expect(element.querySelector('app-product-section-nav')).toBeNull();
    await harness.navigateByUrl('/productos/weg-w22-3kw');
    expect(element.querySelector('app-product-detail-page h1')?.textContent).toBe(
      W22_PRODUCT_DETAIL.name,
    );
  });

  it('places recommendations and section navigation after the overview', () => {
    const page = element.querySelector('app-product-detail-page')!;
    const overview = page.querySelector('.product-detail__overview')!;
    const recommendations = page.querySelector('app-product-recommendations')!;
    const nav = page.querySelector('app-product-section-nav')!;
    expect(
      overview.compareDocumentPosition(recommendations) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      recommendations.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(recommendations.querySelectorAll('app-product-card')).toHaveLength(6);
  });

  it('provides one empty, focusable destination for every section link', () => {
    const page = element.querySelector('app-product-detail-page')!;
    const links = page.querySelectorAll<HTMLAnchorElement>('app-product-section-nav a');
    expect(links).toHaveLength(6);
    links.forEach((link) => {
      const targets = page.querySelectorAll<HTMLElement>(link.hash);
      expect(targets).toHaveLength(1);
      expect(targets[0].getAttribute('aria-label')).toBe(link.textContent?.trim());
      expect(targets[0].tabIndex).toBe(-1);
      expect(targets[0].textContent?.trim()).toBe('');
      expect(targets[0].children).toHaveLength(0);
    });
  });

  it('restores the router scroll offset when leaving the detail page', async () => {
    const setOffset = vi.spyOn(TestBed.inject(ViewportScroller), 'setOffset');
    await harness.navigateByUrl('/productos');
    expect(setOffset).toHaveBeenCalledWith([0, 0]);
  });
});
