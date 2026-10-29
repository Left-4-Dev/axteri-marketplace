import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';
import { RECOMMENDED_PRODUCTS } from '../../data/home-products.data';
import { Recommendations } from './recommendations';

describe('Recommendations', () => {
  let fixture: ComponentFixture<Recommendations>;
  let element: HTMLElement;

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

  it('omits load more because the current source has no additional products or loading action', () => {
    expect(element.textContent?.toUpperCase()).not.toContain('CARGAR MÁS');
    expect(element.querySelector('section > button')).toBeNull();
    expect(element.querySelectorAll('app-product-card')).toHaveLength(10);
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
