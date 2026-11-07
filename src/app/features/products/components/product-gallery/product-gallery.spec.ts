import { ComponentFixture, TestBed } from '@angular/core/testing';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductGallery } from './product-gallery';

describe('ProductGallery', () => {
  let fixture: ComponentFixture<ProductGallery>;
  let element: HTMLElement;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductGallery] }).compileComponents();
    fixture = TestBed.createComponent(ProductGallery);
    fixture.componentRef.setInput('images', W22_PRODUCT_DETAIL.images);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  it('selects the first image and exposes semantic thumbnail buttons', () => {
    const buttons = element.querySelectorAll('.product-gallery__thumbnails button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0].getAttribute('aria-label')).toContain('Ver imagen 1');
    expect(element.querySelector('.product-gallery__image')?.getAttribute('alt')).toBe(
      W22_PRODUCT_DETAIL.images[0].alt,
    );
  });

  it('changes the main image and pressed state when a thumbnail is activated', async () => {
    element.querySelectorAll<HTMLButtonElement>('.product-gallery__thumbnails button')[1].click();
    await fixture.whenStable();
    expect(element.querySelector('.product-gallery__image')?.getAttribute('src')).toBe(
      W22_PRODUCT_DETAIL.images[1].src,
    );
    expect(
      element
        .querySelectorAll('.product-gallery__thumbnails button')[1]
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      element
        .querySelectorAll('.product-gallery__thumbnails button')[0]
        .getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it('resets selection when a different gallery is supplied', async () => {
    element.querySelectorAll<HTMLButtonElement>('.product-gallery__thumbnails button')[2].click();
    await fixture.whenStable();
    fixture.componentRef.setInput('images', [W22_PRODUCT_DETAIL.images[0]]);
    await fixture.whenStable();
    expect(element.querySelector('.product-gallery__image')?.getAttribute('src')).toBe(
      W22_PRODUCT_DETAIL.images[0].src,
    );
    expect(element.querySelector('.product-gallery__counter')?.textContent).toContain('1 / 1');
  });

  it('toggles a favorite only within this view', async () => {
    const favorite = element.querySelector<HTMLButtonElement>('.product-gallery__favorite')!;
    favorite.click();
    await fixture.whenStable();
    expect(favorite.getAttribute('aria-pressed')).toBe('true');
    favorite.click();
    await fixture.whenStable();
    expect(favorite.getAttribute('aria-pressed')).toBe('false');
  });
});
