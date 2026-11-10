import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';
import { PRODUCT_LISTING_ITEMS } from '../../data/product-listing.data';
import { PRODUCT_DETAIL_RECOMMENDATIONS } from '../../data/product-recommendations.data';
import { ProductRecommendations } from './product-recommendations';

describe('ProductRecommendations', () => {
  let fixture: ComponentFixture<ProductRecommendations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRecommendations],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductRecommendations);
    fixture.componentRef.setInput('products', PRODUCT_DETAIL_RECOMMENDATIONS);
    await fixture.whenStable();
  });

  it('renders a labelled section and six existing products using default ProductCards', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h2')?.textContent).toBe('Recomendados para ti');
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(
      element.querySelector('h2')?.id,
    );
    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards).toHaveLength(6);
    cards.forEach((card, index) => {
      const component = card.componentInstance as ProductCard;
      expect(component.product()).toBe(PRODUCT_LISTING_ITEMS[index]);
      expect(component.variant()).toBe('default');
      expect(card.nativeElement.textContent).toContain(PRODUCT_DETAIL_RECOMMENDATIONS[index].name);
    });
  });

  it('updates the products supplied by the page', async () => {
    fixture.componentRef.setInput('products', [PRODUCT_LISTING_ITEMS[2]]);
    await fixture.whenStable();
    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards).toHaveLength(1);
    expect((cards[0].componentInstance as ProductCard).product()).toBe(PRODUCT_LISTING_ITEMS[2]);
  });

  it('omits an empty recommendations section', async () => {
    fixture.componentRef.setInput('products', []);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });
});
