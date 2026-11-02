import { TestBed } from '@angular/core/testing';
import { Product, ProductPrice } from '../../../models/product.model';
import { ProductCard } from './product-card';

const product: Product = {
  id: 'test-product',
  name: 'Motor industrial',
  brand: 'Siemens',
  price: { kind: 'quote' },
};

describe('ProductCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductCard] }).compileComponents();
  });

  const cases: { label: string; price: ProductPrice; expected: readonly string[] }[] = [
    {
      label: 'fixed price and previous price',
      price: { kind: 'fixed', amount: 1200, previousAmount: 1500, currency: 'PEN' },
      expected: ['1,200.00', 'Antes:', '1,500.00'],
    },
    {
      label: 'price range',
      price: { kind: 'range', min: 1200, max: 1250, currency: 'PEN' },
      expected: ['1,200.00', '1,250.00'],
    },
    { label: 'quote-only price', price: { kind: 'quote' }, expected: ['Por cotizar'] },
  ];

  for (const { label, price, expected } of cases) {
    it(`renders a ${label} without requiring an image`, async () => {
      const fixture = TestBed.createComponent(ProductCard);
      fixture.componentRef.setInput('product', { ...product, price });
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      for (const text of expected) {
        expect(element.querySelector('.product-card__price')?.textContent).toContain(text);
      }
      expect(element.querySelector('img')).toBeNull();
      expect(element.textContent).toContain('Imagen de producto pendiente');
    });
  }

  it('emits the supplied product without coupling actions to a service', async () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', product);
    const onQuote = vi.fn();
    const onDetails = vi.fn();
    fixture.componentInstance.requestQuote.subscribe(onQuote);
    fixture.componentInstance.viewDetails.subscribe(onDetails);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('button[aria-label^="Consultar"]')?.click();
    element.querySelector<HTMLButtonElement>('button[aria-label^="Ver ficha"]')?.click();

    expect(onQuote).toHaveBeenCalledExactlyOnceWith(product);
    expect(onDetails).toHaveBeenCalledExactlyOnceWith(product);
  });

  it('renders offer pricing, derived discount and a labelled presentation countdown', async () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('variant', 'offer');
    fixture.componentRef.setInput('product', {
      ...product,
      price: {
        kind: 'fixed',
        amount: 1200,
        previousAmount: 1500,
        currency: 'PEN',
        unitLabel: 'Por unidad',
        includesTax: true,
      },
      offer: { countdown: { kind: 'presentation', days: 2, hours: 5, minutes: 23, seconds: 45 } },
    } satisfies Product);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('article')?.classList).toContain('product-card--offer');
    expect(element.querySelector('.product-card__current-price')?.textContent).toContain(
      'S/ 1,200.00',
    );
    expect(element.querySelector('.product-card__discount')?.getAttribute('aria-label')).toBe(
      '20% de descuento',
    );
    expect(element.querySelector('.product-card__previous-price')?.textContent).toContain(
      'S/ 1,500.00',
    );
    expect(element.querySelector('.product-card__terms')?.textContent).toContain('Por unidad');
    expect(element.querySelector('.product-card__terms')?.textContent).toContain('Incluye IGV');
    const infoIcon = element.querySelector<HTMLImageElement>('.product-card__info-icon');
    expect(infoIcon?.getAttribute('src')).toBe('/assets/icons/product/info.svg');
    expect(infoIcon?.getAttribute('alt')).toBe('');
    expect(element.querySelector('.product-card__countdown')?.getAttribute('aria-label')).toBe(
      'Tiempo restante de ejemplo: 2 días, 5 horas, 23 minutos, 45 segundos',
    );
    expect(
      Array.from(
        element.querySelectorAll('.product-card__time-part b'),
        (part) => part.textContent,
      ),
    ).toEqual(['02', '05', '23', '45']);
    const actions = element.querySelectorAll<HTMLButtonElement>(
      '.product-card__quick-actions button',
    );
    expect(actions).toHaveLength(2);
    actions.forEach((button) => {
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('aria-label')).toContain(product.name);
      expect(button.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('does not assume tax, discount or a deadline when offer metadata is absent', async () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('variant', 'offer');
    fixture.componentRef.setInput('product', {
      ...product,
      price: { kind: 'fixed', amount: 1200, currency: 'PEN' },
    } satisfies Product);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.product-card__discount')).toBeNull();
    expect(element.querySelector('.product-card__countdown')).toBeNull();
    expect(element.textContent).not.toContain('IGV');
    expect(element.textContent).not.toContain('Por unidad');
  });

  it('keeps the default variant free of offer visuals even with offer metadata', async () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', {
      ...product,
      offer: { countdown: { kind: 'presentation', days: 2, hours: 5, minutes: 23, seconds: 45 } },
    } satisfies Product);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.variant()).toBe('default');
    expect(element.querySelector('.product-card__offer-band')).toBeNull();
    expect(element.querySelector('.product-card__quick-actions')).toBeNull();
    expect(element.querySelectorAll('.product-card__actions button')).toHaveLength(2);
  });

  it('uses the product image contract and an accessible product name', async () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('variant', 'offer');
    fixture.componentRef.setInput('product', { ...product, imageUrl: '/assets/product-test.png' });
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('img')?.alt).toBe(product.name);
    expect(element.querySelector('img')?.getAttribute('src')).toBe('/assets/product-test.png');
    expect(element.querySelector('.product-card__placeholder')).toBeNull();
  });

  it('renders default seller information and preserves accessible image actions', async () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', {
      ...product,
      seller: { name: 'LDF Projects', location: 'San Miguel, Lima', years: 20 },
    } satisfies Product);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.product-card__seller-name')?.textContent).toBe('LDF Projects');
    expect(element.querySelector('.product-card__location')?.textContent).toContain(
      'San Miguel, Lima',
    );
    expect(
      element.querySelector('.product-card__tenure [role="img"]')?.getAttribute('aria-label'),
    ).toBe('Antigüedad del vendedor');
    expect(element.querySelector('.product-card__tenure')?.textContent).toContain('20 años');
    const actions = element.querySelectorAll<HTMLButtonElement>('.product-card__visual button');
    expect(actions).toHaveLength(2);
    actions.forEach((button) => {
      expect(button.disabled).toBe(false);
      expect(button.getAttribute('aria-label')).toContain(product.name);
      expect(button.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
    });
    expect(element.querySelector('.product-card__terms')).toBeNull();
  });

  for (const includesTax of [true, false, undefined]) {
    it(`uses only supplied commercial terms in the default variant (tax: ${includesTax})`, async () => {
      const fixture = TestBed.createComponent(ProductCard);
      fixture.componentRef.setInput('product', {
        ...product,
        price: {
          kind: 'fixed',
          amount: 8500,
          previousAmount: 9500,
          currency: 'PEN',
          ...(includesTax === undefined ? {} : { includesTax, unitLabel: 'Por unidad' }),
        },
      } satisfies Product);
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('.product-card__current-price')?.textContent).toContain(
        'S/ 8,500.00',
      );
      expect(element.querySelector('.product-card__discount')?.getAttribute('aria-label')).toBe(
        '10.5% de descuento',
      );
      if (includesTax === undefined) {
        expect(element.querySelector('.product-card__terms')).toBeNull();
        expect(element.textContent).not.toContain('IGV');
      } else {
        expect(element.querySelector('.product-card__terms')?.textContent).toContain('*Por unidad');
        expect(element.querySelector('.product-card__terms')?.textContent).toContain(
          includesTax ? 'Incluye IGV' : 'No incluye IGV',
        );
        expect(element.querySelector('.product-card__info-icon')?.getAttribute('src')).toBe(
          '/assets/icons/product/info.svg',
        );
      }
    });
  }

  describe('list variant', () => {
    it('accepts variant="list", applies the modifier class, and renders brand, name, and seller', async () => {
      const fixture = TestBed.createComponent(ProductCard);
      fixture.componentRef.setInput('variant', 'list');
      fixture.componentRef.setInput('product', {
        ...product,
        seller: {
          name: 'LDF Projects',
          location: 'San Miguel, Lima',
          years: 20,
          verified: true,
        },
      } satisfies Product);
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      const article = element.querySelector('article')!;
      expect(article.classList.contains('product-card--list')).toBe(true);
      expect(article.classList.contains('product-card--default')).toBe(false);
      expect(article.classList.contains('product-card--offer')).toBe(false);
      expect(element.querySelector('.product-card__brand')?.textContent).toBe('Siemens');
      expect(element.querySelector('.product-card__title')?.textContent).toBe('Motor industrial');
      expect(element.querySelector('.product-card__seller-name')?.textContent).toBe('LDF Projects');
      expect(element.querySelector('.product-card__location')?.textContent).toContain(
        'San Miguel, Lima',
      );
      expect(element.querySelector('.product-card__tenure')?.textContent).toContain('20 años');
      expect(element.querySelector('.product-card__verified')?.textContent?.trim()).toBe(
        'Verificado',
      );
      expect(element.querySelector('.product-card__actions')).toBeNull();
      expect(element.querySelector('.product-card__quick-actions')).toBeNull();
    });

    it('renders optional description, badge, and minOrderLabel only when provided', async () => {
      const fixture = TestBed.createComponent(ProductCard);
      fixture.componentRef.setInput('variant', 'list');
      fixture.componentRef.setInput('product', product);
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('.product-card__description')).toBeNull();
      expect(element.querySelector('.product-card__badge')).toBeNull();
      expect(element.querySelector('.product-card__terms')).toBeNull();

      fixture.componentRef.setInput('product', {
        ...product,
        description: 'Motor eléctrico trifásico de alta eficiencia industrial.',
        badge: 'Nuevo lanzamiento',
        minOrderLabel: 'Pedido mínimo: 3 unidades',
        price: {
          kind: 'fixed',
          amount: 345,
          previousAmount: 450,
          currency: 'PEN',
          unitLabel: 'Por mayor',
          includesTax: true,
        },
      } satisfies Product);
      await fixture.whenStable();

      expect(element.querySelector('.product-card__description')?.textContent?.trim()).toBe(
        'Motor eléctrico trifásico de alta eficiencia industrial.',
      );
      expect(element.querySelector('.product-card__badge')?.textContent?.trim()).toBe(
        'Nuevo lanzamiento',
      );
      const termsText = element.querySelector('.product-card__terms')?.textContent ?? '';
      expect(termsText).toContain('*Por mayor');
      expect(termsText).toContain('Pedido mínimo: 3 unidades');
      expect(termsText).toContain('Incluye IGV');
    });

    for (const { label, price, expected } of cases) {
      it(`supports ${label} in list variant`, async () => {
        const fixture = TestBed.createComponent(ProductCard);
        fixture.componentRef.setInput('variant', 'list');
        fixture.componentRef.setInput('product', { ...product, price });
        await fixture.whenStable();

        const element = fixture.nativeElement as HTMLElement;
        for (const text of expected) {
          expect(element.querySelector('.product-card__price')?.textContent).toContain(text);
        }
        if (price.kind === 'fixed' && price.previousAmount) {
          expect(element.querySelector('.product-card__discount')?.getAttribute('aria-label')).toBe(
            '20% de descuento',
          );
        }
      });
    }

    it('emits viewDetails and requestQuote from the textual list CTAs', async () => {
      const fixture = TestBed.createComponent(ProductCard);
      fixture.componentRef.setInput('variant', 'list');
      fixture.componentRef.setInput('product', product);
      const onQuote = vi.fn();
      const onDetails = vi.fn();
      fixture.componentInstance.requestQuote.subscribe(onQuote);
      fixture.componentInstance.viewDetails.subscribe(onDetails);
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      const ctas = element.querySelectorAll<HTMLButtonElement>(
        '.product-card__list-actions button',
      );
      expect(ctas).toHaveLength(2);
      expect(ctas[0].textContent?.trim()).toBe('Contactar proveedor');
      expect(ctas[1].textContent?.trim()).toBe('Solicitar cotización');

      ctas[0].click();
      ctas[1].click();

      expect(onDetails).toHaveBeenCalledExactlyOnceWith(product);
      expect(onQuote).toHaveBeenCalledExactlyOnceWith(product);
    });
  });
});
