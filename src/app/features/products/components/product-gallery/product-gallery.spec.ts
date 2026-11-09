import { ComponentFixture, TestBed } from '@angular/core/testing';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductGallery } from './product-gallery';

describe('ProductGallery', () => {
  let fixture: ComponentFixture<ProductGallery>;
  let element: HTMLElement;
  beforeEach(async () => {
    document.body.style.overflow = '';
    await TestBed.configureTestingModule({ imports: [ProductGallery] }).compileComponents();
    fixture = TestBed.createComponent(ProductGallery);
    fixture.componentRef.setInput('images', W22_PRODUCT_DETAIL.images);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  it('selects the first image and exposes semantic thumbnail buttons', () => {
    const buttons = element.querySelectorAll('.product-gallery__thumbnails button');
    expect(buttons).toHaveLength(5);
    expect(new Set(W22_PRODUCT_DETAIL.images.map((image) => image.src)).size).toBe(5);
    expect(element.querySelector('.product-gallery__counter')?.textContent).toContain('1 / 5');
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

  it('advances through the gallery and wraps to the first image', async () => {
    const next = element.querySelector<HTMLButtonElement>('.product-gallery__next')!;
    for (let index = 1; index <= W22_PRODUCT_DETAIL.images.length; index++) {
      next.click();
      await fixture.whenStable();
      const expected = index % W22_PRODUCT_DETAIL.images.length;
      expect(element.querySelector('.product-gallery__image')?.getAttribute('src')).toBe(
        W22_PRODUCT_DETAIL.images[expected].src,
      );
      expect(element.querySelector('.product-gallery__counter')?.textContent).toContain(
        `${expected + 1} / ${W22_PRODUCT_DETAIL.images.length}`,
      );
    }
  });

  it('falls back to the provisional image without changing selection or count', async () => {
    const image = element.querySelector<HTMLImageElement>('.product-gallery__image')!;
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe(W22_PRODUCT_DETAIL.images[0].fallbackSrc);
    expect(image.alt).toBe(W22_PRODUCT_DETAIL.images[0].fallbackAlt);
    expect(element.querySelector('figcaption')?.textContent).toContain('provisional');
    expect(element.querySelector('.product-gallery__counter')?.textContent).toContain('1 / 5');
    image.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(image.style.visibility).toBe('visible');
  });

  it('uses supplied icons when loaded and inline icons while unavailable', async () => {
    fixture.componentRef.setInput('icons', W22_PRODUCT_DETAIL.galleryIcons);
    await fixture.whenStable();
    const image = element.querySelector<HTMLImageElement>('.product-gallery__favorite img')!;
    expect(element.querySelector('.product-gallery__favorite svg')).not.toBeNull();
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.style.visibility).toBe('hidden');
    expect(element.querySelector('.product-gallery__favorite svg')).not.toBeNull();
    image.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(element.querySelector('.product-gallery__favorite svg')).toBeNull();
    expect(image.style.visibility).toBe('visible');
  });

  describe('lightbox', () => {
    const expandButton = () =>
      element.querySelector<HTMLButtonElement>('.product-gallery__expand')!;
    const dialog = () =>
      element.querySelector<HTMLDialogElement>('dialog.product-gallery__lightbox');
    const closeButton = () =>
      element.querySelector<HTMLButtonElement>('button[aria-label="Cerrar vista ampliada"]');
    const prevButton = () =>
      element.querySelector<HTMLButtonElement>('button[aria-label="Imagen anterior"]');
    const nextButton = () =>
      element.querySelector<HTMLButtonElement>('button[aria-label="Imagen siguiente"]');
    const lightboxImage = () =>
      element.querySelector<HTMLImageElement>('.product-gallery__lightbox-image');
    const lightboxCounter = () =>
      element.querySelector<HTMLElement>('.product-gallery__lightbox-counter');

    it('opens the lightbox with the currently selected image and dynamic counter, locks body scroll, and focuses close', async () => {
      const emit = vi.spyOn(fixture.componentInstance.imageViewRequest, 'emit');
      element.querySelectorAll<HTMLButtonElement>('.product-gallery__thumbnails button')[2].click();
      await fixture.whenStable();

      expandButton().click();
      await fixture.whenStable();

      expect(emit).toHaveBeenCalledWith(W22_PRODUCT_DETAIL.images[2]);
      expect(dialog()).not.toBeNull();
      expect(dialog()?.hasAttribute('open')).toBe(true);
      expect(lightboxImage()?.getAttribute('src')).toBe(W22_PRODUCT_DETAIL.images[2].src);
      expect(lightboxImage()?.getAttribute('alt')).toBe(W22_PRODUCT_DETAIL.images[2].alt);
      expect(lightboxCounter()?.textContent?.trim()).toBe('3 / 5');
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.activeElement).toBe(closeButton());
    });

    it('closes the lightbox via the close button, unlocks body scroll, and restores focus to Expand', async () => {
      expandButton().click();
      await fixture.whenStable();
      expect(dialog()).not.toBeNull();

      closeButton()!.click();
      await fixture.whenStable();

      expect(dialog()).toBeNull();
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(expandButton());
    });

    it('closes the lightbox on Escape and restores focus to Expand', async () => {
      expandButton().click();
      await fixture.whenStable();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();

      expect(dialog()).toBeNull();
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(expandButton());
    });

    it('navigates with prev/next buttons and ArrowRight/ArrowLeft, disabling controls at the boundaries', async () => {
      expandButton().click();
      await fixture.whenStable();

      expect(prevButton()?.disabled).toBe(true);
      expect(nextButton()?.disabled).toBe(false);
      expect(lightboxCounter()?.textContent?.trim()).toBe('1 / 5');

      nextButton()!.click();
      await fixture.whenStable();
      expect(lightboxImage()?.getAttribute('src')).toBe(W22_PRODUCT_DETAIL.images[1].src);
      expect(lightboxCounter()?.textContent?.trim()).toBe('2 / 5');
      expect(prevButton()?.disabled).toBe(false);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await fixture.whenStable();
      expect(lightboxCounter()?.textContent?.trim()).toBe('3 / 5');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await fixture.whenStable();
      expect(lightboxCounter()?.textContent?.trim()).toBe('2 / 5');

      // Advance to the last image and verify next becomes disabled and shifts focus if focused.
      element.querySelectorAll<HTMLButtonElement>('.product-gallery__thumbnails button')[3].click();
      await fixture.whenStable();
      nextButton()!.focus();
      nextButton()!.click();
      await fixture.whenStable();

      expect(lightboxCounter()?.textContent?.trim()).toBe('5 / 5');
      expect(nextButton()?.disabled).toBe(true);
      expect(prevButton()?.disabled).toBe(false);
      expect(document.activeElement).toBe(prevButton());
    });

    it('closes when clicking the backdrop, but stays open when clicking the image or controls', async () => {
      expandButton().click();
      await fixture.whenStable();

      lightboxImage()!.click();
      await fixture.whenStable();
      expect(dialog()).not.toBeNull();

      lightboxCounter()!.click();
      await fixture.whenStable();
      expect(dialog()).not.toBeNull();

      dialog()!.click();
      await fixture.whenStable();
      expect(dialog()).toBeNull();
    });
  });
});
