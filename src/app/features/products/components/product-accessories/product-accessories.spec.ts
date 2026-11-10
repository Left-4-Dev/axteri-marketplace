import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductAccessories } from './product-accessories';

describe('ProductAccessories', () => {
  let fixture: ComponentFixture<ProductAccessories>;
  let element: HTMLElement;
  const dataset = W22_PRODUCT_DETAIL.accessories;

  async function render(value: readonly Product[] = dataset): Promise<void> {
    fixture = TestBed.createComponent(ProductAccessories);
    fixture.componentRef.setInput('accessories', value);
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductAccessories],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the section heading Accesorios', async () => {
    await render();
    expect(element.querySelector('h2')?.textContent).toBe('Accesorios');
  });

  it('renders the full dataset in expected order reusing the default ProductCard', async () => {
    await render();
    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards).toHaveLength(dataset.length);

    cards.forEach((cardDebug, index) => {
      const instance = cardDebug.componentInstance as ProductCard;
      expect(instance.product()).toBe(dataset[index]);
      expect(instance.variant()).toBe('default');
      expect(cardDebug.nativeElement.querySelector('h3')?.textContent?.trim()).toBe(
        dataset[index].name,
      );
    });
  });

  it('tracks items by stable product id when the order changes', async () => {
    await render();
    const firstItemBefore = element.querySelectorAll('.product-accessories__item')[0];

    fixture.componentRef.setInput('accessories', [...dataset].reverse());
    await fixture.whenStable();

    const itemsAfter = element.querySelectorAll('.product-accessories__item');
    expect(itemsAfter[itemsAfter.length - 1]).toBe(firstItemBefore);
  });

  it('forwards quote and details actions from ProductCard', async () => {
    await render();
    const quoteSpy = vi.fn();
    const detailsSpy = vi.fn();
    fixture.componentInstance.requestQuote.subscribe(quoteSpy);
    fixture.componentInstance.viewDetails.subscribe(detailsSpy);

    const firstCardButtons = element.querySelectorAll<HTMLButtonElement>(
      'app-product-card .product-card__actions button',
    );
    firstCardButtons[0].click();
    firstCardButtons[1].click();

    expect(quoteSpy).toHaveBeenCalledWith(dataset[0]);
    expect(detailsSpy).toHaveBeenCalledWith(dataset[0]);
  });

  it('omits the grid panel when no accessories are provided', async () => {
    await render([]);
    expect(element.querySelector('h2')?.textContent).toBe('Accesorios');
    expect(element.querySelector('.product-accessories__panel')).toBeNull();
    expect(element.querySelectorAll('app-product-card')).toHaveLength(0);
  });
});
