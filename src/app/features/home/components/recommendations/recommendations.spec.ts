import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';
import { RECOMMENDED_PRODUCTS } from '../../data/home-products.data';
import { Recommendations } from './recommendations';

describe('Recommendations', () => {
  let fixture: ComponentFixture<Recommendations>;
  let element: HTMLElement;

  // Larger inputs are test fixtures only; production data remains unchanged.
  const productsWithCount = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
      ...RECOMMENDED_PRODUCTS[index % RECOMMENDED_PRODUCTS.length],
      id: `recommendation-test-${index}`,
    }));
  const loadMoreButton = () =>
    element.querySelector<HTMLButtonElement>('.recommendations__more button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Recommendations] }).compileComponents();
    fixture = TestBed.createComponent(Recommendations);
    fixture.componentRef.setInput('products', RECOMMENDED_PRODUCTS);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders a section labelled by its heading and a semantic product list', () => {
    const heading = element.querySelector('h2')!;
    expect(heading.textContent).toBe('SUGERENCIAS PARA TI');
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(element.querySelector('ul')?.getAttribute('role')).toBe('list');
    expect(element.querySelectorAll('.recommendations__item')).toHaveLength(10);
  });

  it('passes all ten existing products unchanged and in order to ProductCard default', () => {
    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards).toHaveLength(RECOMMENDED_PRODUCTS.length);
    cards.forEach((card, index) => {
      const instance = card.componentInstance as ProductCard;
      expect(instance.product()).toBe(RECOMMENDED_PRODUCTS[index]);
      expect(instance.variant()).toBe('default');
    });
    expect(element.querySelectorAll('.product-card__placeholder')).toHaveLength(10);
    expect(element.querySelector('.product-card--offer')).toBeNull();
  });

  it('starts with a limit of ten and omits load more when all ten products are visible', () => {
    expect(fixture.componentInstance.visibleCount()).toBe(10);
    expect(element.textContent?.toUpperCase()).not.toContain('CARGAR MÁS');
    expect(element.querySelector('section > button')).toBeNull();
    expect(element.querySelectorAll('app-product-card')).toHaveLength(10);
  });

  it('shows only ten cards and an enabled load button for fifteen products', async () => {
    const products = productsWithCount(15);
    fixture.componentRef.setInput('products', products);
    await fixture.whenStable();

    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards.map((card) => (card.componentInstance as ProductCard).product())).toEqual(
      products.slice(0, 10),
    );
    expect(loadMoreButton()?.textContent).toBe('CARGAR MÁS');
    expect(loadMoreButton()?.type).toBe('button');
    expect(loadMoreButton()?.disabled).toBe(false);
  });

  it('shows all fifteen products and removes the button after a click', async () => {
    fixture.componentRef.setInput('products', productsWithCount(15));
    await fixture.whenStable();
    loadMoreButton()!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.visibleCount()).toBe(15);
    expect(element.querySelectorAll('app-product-card')).toHaveLength(15);
    expect(loadMoreButton()).toBeNull();
  });

  it('keeps the button while another batch remains and removes it after all twenty-five products', async () => {
    fixture.componentRef.setInput('products', productsWithCount(25));
    await fixture.whenStable();
    loadMoreButton()!.click();
    await fixture.whenStable();

    expect(element.querySelectorAll('app-product-card')).toHaveLength(20);
    expect(loadMoreButton()).not.toBeNull();
    loadMoreButton()!.click();
    await fixture.whenStable();

    expect(element.querySelectorAll('app-product-card')).toHaveLength(25);
    expect(loadMoreButton()).toBeNull();
  });

  it('reacts to the input growing from ten to fifteen products without changing the visible limit', async () => {
    expect(loadMoreButton()).toBeNull();
    fixture.componentRef.setInput('products', productsWithCount(15));
    await fixture.whenStable();

    expect(fixture.componentInstance.visibleCount()).toBe(10);
    expect(element.querySelectorAll('app-product-card')).toHaveLength(10);
    expect(loadMoreButton()).not.toBeNull();
  });

  it('shows the button again when the input grows after the previous batch was exhausted', async () => {
    fixture.componentRef.setInput('products', productsWithCount(15));
    await fixture.whenStable();
    loadMoreButton()!.click();
    await fixture.whenStable();
    expect(loadMoreButton()).toBeNull();

    fixture.componentRef.setInput('products', productsWithCount(20));
    await fixture.whenStable();
    expect(element.querySelectorAll('app-product-card')).toHaveLength(15);
    expect(loadMoreButton()).not.toBeNull();
  });

  it('renders an accessible empty state without cards or a load button', async () => {
    fixture.componentRef.setInput('products', []);
    await fixture.whenStable();
    expect(element.querySelector('app-product-card, button')).toBeNull();
    expect(element.textContent).toContain('No hay sugerencias disponibles.');
    expect(element.querySelector('h2')).not.toBeNull();
  });

  it('reflects replacement inputs without retaining or duplicating products', async () => {
    const replacement = RECOMMENDED_PRODUCTS.slice(2, 5).reverse();
    fixture.componentRef.setInput('products', replacement);
    await fixture.whenStable();
    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards.map((card) => (card.componentInstance as ProductCard).product())).toEqual(
      replacement,
    );
    expect(element.querySelectorAll('.recommendations__item')).toHaveLength(3);
  });
});
