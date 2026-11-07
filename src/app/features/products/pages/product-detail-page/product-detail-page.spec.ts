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

  it('provides one focusable destination for every section link', () => {
    const page = element.querySelector('app-product-detail-page')!;
    const links = page.querySelectorAll<HTMLAnchorElement>('app-product-section-nav a');
    const implemented = new Set([
      '#caracteristicas',
      '#descripcion',
      '#documentos',
      '#accesorios',
      '#variaciones',
    ]);
    expect(links).toHaveLength(6);
    links.forEach((link) => {
      const targets = page.querySelectorAll<HTMLElement>(link.hash);
      expect(targets).toHaveLength(1);
      expect(targets[0].getAttribute('aria-label')).toBe(link.textContent?.trim());
      expect(targets[0].tabIndex).toBe(-1);
      if (!implemented.has(link.hash)) {
        expect(targets[0].textContent?.trim()).toBe('');
        expect(targets[0].children).toHaveLength(0);
      }
    });
  });

  it('renders the technical specifications inside the existing #caracteristicas destination', () => {
    const page = element.querySelector('app-product-detail-page')!;
    const link = Array.from(
      page.querySelectorAll<HTMLAnchorElement>('app-product-section-nav a'),
    ).find((item) => item.textContent?.trim() === 'Características')!;
    expect(link.hash).toBe('#caracteristicas');
    expect(page.querySelectorAll('[id="caracteristicas"]')).toHaveLength(1);
    const target = page.querySelector('#caracteristicas')!;
    expect(target.querySelector('app-product-specifications h2')?.textContent).toBe(
      'Características',
    );
    expect(
      target.querySelectorAll('app-product-specifications .product-specifications__group'),
    ).toHaveLength(W22_PRODUCT_DETAIL.specifications.groups.length);
  });

  it('renders description and documents in their existing destinations while keeping future anchors empty', () => {
    const page = element.querySelector('app-product-detail-page')!;
    const navLinks = Array.from(
      page.querySelectorAll<HTMLAnchorElement>('app-product-section-nav a'),
    );

    expect(navLinks.find((link) => link.textContent?.trim() === 'Descripción')?.hash).toBe(
      '#descripcion',
    );
    expect(navLinks.find((link) => link.textContent?.trim() === 'Documentos')?.hash).toBe(
      '#documentos',
    );

    expect(page.querySelectorAll('[id="descripcion"]')).toHaveLength(1);
    expect(page.querySelectorAll('[id="documentos"]')).toHaveLength(1);

    const specs = page.querySelector('#caracteristicas')!;
    const description = page.querySelector('#descripcion')!;
    const documents = page.querySelector('#documentos')!;

    expect(
      specs.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      description.compareDocumentPosition(documents) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(description.querySelector('app-product-description h2')?.textContent).toBe(
      'Descripción',
    );
    expect(documents.querySelector('app-product-documents h2')?.textContent).toBe('Documentos');
    expect(documents.querySelectorAll('.product-documents__card')).toHaveLength(
      W22_PRODUCT_DETAIL.documents.length,
    );

    const pendingReviews = page.querySelector('#resenas')!;
    expect(pendingReviews.children).toHaveLength(0);
    expect(pendingReviews.textContent?.trim()).toBe('');
  });

  it('renders accessories and variants in DOM order while keeping #resenas empty', () => {
    const page = element.querySelector('app-product-detail-page')!;
    const navLinks = Array.from(
      page.querySelectorAll<HTMLAnchorElement>('app-product-section-nav a'),
    );

    expect(navLinks.find((link) => link.textContent?.trim() === 'Accesorios')?.hash).toBe(
      '#accesorios',
    );
    expect(navLinks.find((link) => link.textContent?.trim() === 'Variaciones')?.hash).toBe(
      '#variaciones',
    );

    expect(page.querySelectorAll('[id="accesorios"]')).toHaveLength(1);
    expect(page.querySelectorAll('[id="variaciones"]')).toHaveLength(1);
    expect(page.querySelectorAll('[id="resenas"]')).toHaveLength(1);

    const documents = page.querySelector('#documentos')!;
    const accessories = page.querySelector('#accesorios')!;
    const variants = page.querySelector('#variaciones')!;
    const reviews = page.querySelector('#resenas')!;

    expect(
      documents.compareDocumentPosition(accessories) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      accessories.compareDocumentPosition(variants) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      variants.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(accessories.querySelector('app-product-accessories h2')?.textContent).toBe('Accesorios');
    expect(accessories.querySelectorAll('app-product-card')).toHaveLength(
      W22_PRODUCT_DETAIL.accessories.length,
    );

    expect(variants.querySelector('app-product-variants h2')?.textContent).toBe('Variaciones');
    expect(variants.querySelectorAll('tbody .product-variants__row')).toHaveLength(
      W22_PRODUCT_DETAIL.variants.length,
    );
    expect(variants.querySelector('.product-variants__sku')?.textContent).toBe(
      W22_PRODUCT_DETAIL.sku,
    );

    expect(reviews.children).toHaveLength(0);
    expect(reviews.textContent?.trim()).toBe('');
  });

  it('keeps overview gallery, favorite, quantity and accessories intact when filtering or selecting variants', async () => {
    const page = element.querySelector('app-product-detail-page')!;
    page.querySelectorAll<HTMLButtonElement>('.product-gallery__thumbnails button')[2].click();
    page.querySelector<HTMLButtonElement>('.product-gallery__favorite')!.click();
    page.querySelector<HTMLButtonElement>('[aria-label="Aumentar cantidad"]')!.click();
    await harness.fixture.whenStable();

    const chips = Array.from(
      page.querySelectorAll<HTMLButtonElement>('app-product-variants .product-variants__chip'),
    );
    chips.find((btn) => btn.textContent?.trim() === '4 Polos — ~1450 rpm')!.click();
    await harness.fixture.whenStable();

    const filteredRows = page.querySelectorAll<HTMLTableRowElement>(
      'app-product-variants tbody .product-variants__row',
    );
    filteredRows[1].querySelector<HTMLButtonElement>('.product-variants__row-trigger')!.click();
    await harness.fixture.whenStable();

    expect(page.querySelector('app-product-variants .product-variants__sku')?.textContent).toBe(
      'W22-11KW-4P-380-B3-IP55',
    );
    expect(
      page
        .querySelectorAll<HTMLButtonElement>('.product-gallery__thumbnails button')[2]
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(page.querySelector('.product-gallery__favorite')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(page.querySelector<HTMLInputElement>('#product-quantity')?.value).toBe('2');
    expect(page.querySelectorAll('app-product-accessories app-product-card')).toHaveLength(
      W22_PRODUCT_DETAIL.accessories.length,
    );
  });

  it('keeps overview state and route intact when switching specification groups', async () => {
    const page = element.querySelector('app-product-detail-page')!;
    page.querySelectorAll<HTMLButtonElement>('.product-gallery__thumbnails button')[1].click();
    page.querySelector<HTMLButtonElement>('.product-gallery__favorite')!.click();
    page.querySelector<HTMLButtonElement>('[aria-label="Aumentar cantidad"]')!.click();
    await harness.fixture.whenStable();

    const groupButtons = page.querySelectorAll<HTMLButtonElement>('.product-specifications__group');
    groupButtons[2].click();
    await harness.fixture.whenStable();

    expect(groupButtons[2].getAttribute('aria-current')).toBe('true');
    expect(page.querySelector('.product-specifications__panel h3')?.textContent).toContain(
      W22_PRODUCT_DETAIL.specifications.groups[2].title,
    );
    expect(
      page
        .querySelectorAll<HTMLButtonElement>('.product-gallery__thumbnails button')[1]
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(page.querySelector('.product-gallery__favorite')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(page.querySelector<HTMLInputElement>('#product-quantity')?.value).toBe('2');
  });

  it('restores the router scroll offset when leaving the detail page', async () => {
    const setOffset = vi.spyOn(TestBed.inject(ViewportScroller), 'setOffset');
    await harness.navigateByUrl('/productos');
    expect(setOffset).toHaveBeenCalledWith([0, 0]);
  });
});
