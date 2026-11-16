import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';
import { PRODUCT_LISTING_ITEMS } from '../../../products/data/product-listing.data';
import { SellerProducts } from './seller-products';

describe('SellerProducts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'productos', component: SellerProducts }])],
    }),
  );

  it('passes received catalog objects to ProductCard and reacts to input changes', async () => {
    const fixture = TestBed.createComponent(SellerProducts);
    const products = PRODUCT_LISTING_ITEMS.slice(0, 3);
    fixture.componentRef.setInput('products', products);
    await fixture.whenStable();
    const cards = fixture.debugElement.queryAll(By.directive(ProductCard));
    expect(cards).toHaveLength(3);
    cards.forEach((card, index) => {
      expect((card.componentInstance as ProductCard).product()).toBe(products[index]);
      expect(card.nativeElement.textContent).toContain(products[index].name);
    });
    fixture.componentRef.setInput('products', products.slice(0, 1));
    await fixture.whenStable();
    expect(fixture.debugElement.queryAll(By.directive(ProductCard))).toHaveLength(1);
  });

  it('navigates to the catalog with Ver más', async () => {
    const fixture = TestBed.createComponent(SellerProducts);
    fixture.componentRef.setInput('products', []);
    await fixture.whenStable();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.seller-products__more');
    expect(link.getAttribute('href')).toBe('/productos');
    link.click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/productos');
  });
});
