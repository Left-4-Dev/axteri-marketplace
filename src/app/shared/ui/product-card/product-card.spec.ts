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
});
