import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LDF_PROJECTS_SELLER } from '../../data/seller-profile.data';
import { SellerAbout } from './seller-about';

describe('SellerAbout', () => {
  let fixture: ComponentFixture<SellerAbout>;
  let element: HTMLElement;

  beforeEach(async () => {
    document.body.style.overflow = '';
    await TestBed.configureTestingModule({ imports: [SellerAbout] }).compileComponents();
    fixture = TestBed.createComponent(SellerAbout);
    fixture.componentRef.setInput('seller', LDF_PROJECTS_SELLER);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  it('renders paragraphs and gallery from the input without duplicates and handles fallback', async () => {
    const paragraphs = [...element.querySelectorAll('p')];
    expect(paragraphs.map((p) => p.textContent)).toEqual(LDF_PROJECTS_SELLER.description);

    const images: HTMLImageElement[] = Array.from(
      element.querySelectorAll('.seller-about__gallery img'),
    );
    expect(images.map((i) => i.getAttribute('src'))).toEqual(LDF_PROJECTS_SELLER.gallery);
    expect(images).toHaveLength(LDF_PROJECTS_SELLER.gallery.length);
    expect(new Set(LDF_PROJECTS_SELLER.gallery).size).toBe(LDF_PROJECTS_SELLER.gallery.length);

    images[0].dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(images[0].style.visibility).toBe('hidden');
    expect(element.querySelector('.seller-about__fallback')).not.toBeNull();

    images[0].dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(images[0].style.visibility).toBe('visible');
  });

  it('renders an expand button for each image with an accessible label', () => {
    const expandButtons = element.querySelectorAll<HTMLButtonElement>('.seller-about__expand');
    expect(expandButtons).toHaveLength(LDF_PROJECTS_SELLER.gallery.length);
    expandButtons.forEach((btn, index) => {
      expect(btn.getAttribute('aria-label')).toBe(
        `Ampliar imagen ${index + 1} de ${LDF_PROJECTS_SELLER.name}`,
      );
    });
  });

  describe('lightbox', () => {
    const expandButtons = () =>
      element.querySelectorAll<HTMLButtonElement>('.seller-about__expand');
    const dialog = () => element.querySelector<HTMLDialogElement>('dialog.seller-about__lightbox');
    const closeButton = () =>
      element.querySelector<HTMLButtonElement>('button[aria-label="Cerrar vista ampliada"]');
    const prevButton = () =>
      element.querySelector<HTMLButtonElement>('button[aria-label="Imagen anterior"]');
    const nextButton = () =>
      element.querySelector<HTMLButtonElement>('button[aria-label="Imagen siguiente"]');
    const lightboxImage = () =>
      element.querySelector<HTMLImageElement>('.seller-about__lightbox-image');
    const lightboxCounter = () =>
      element.querySelector<HTMLElement>('.seller-about__lightbox-counter');

    it('opens the lightbox with the selected image and dynamic counter, locks body scroll, and focuses close button', async () => {
      expandButtons()[2].click();
      await fixture.whenStable();

      expect(dialog()).not.toBeNull();
      expect(dialog()?.hasAttribute('open')).toBe(true);
      expect(lightboxImage()?.getAttribute('src')).toBe(LDF_PROJECTS_SELLER.gallery[2]);
      expect(lightboxCounter()?.textContent?.trim()).toBe(
        `3 / ${LDF_PROJECTS_SELLER.gallery.length}`,
      );
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.activeElement).toBe(closeButton());
    });

    it('closes the lightbox via the close button, unlocks body scroll, and restores focus to expand button', async () => {
      expandButtons()[1].click();
      await fixture.whenStable();
      expect(dialog()).not.toBeNull();

      closeButton()!.click();
      await fixture.whenStable();

      expect(dialog()).toBeNull();
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(expandButtons()[1]);
    });

    it('closes the lightbox on Escape and restores focus', async () => {
      expandButtons()[0].click();
      await fixture.whenStable();
      expect(dialog()).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();

      expect(dialog()).toBeNull();
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(expandButtons()[0]);
    });

    it('navigates with prev/next buttons and arrow keys, disabling controls at boundaries', async () => {
      expandButtons()[0].click();
      await fixture.whenStable();

      expect(prevButton()?.disabled).toBe(true);
      expect(nextButton()?.disabled).toBe(false);
      expect(lightboxCounter()?.textContent?.trim()).toBe(
        `1 / ${LDF_PROJECTS_SELLER.gallery.length}`,
      );

      nextButton()!.click();
      await fixture.whenStable();
      expect(lightboxImage()?.getAttribute('src')).toBe(LDF_PROJECTS_SELLER.gallery[1]);
      expect(lightboxCounter()?.textContent?.trim()).toBe(
        `2 / ${LDF_PROJECTS_SELLER.gallery.length}`,
      );
      expect(prevButton()?.disabled).toBe(false);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await fixture.whenStable();
      expect(lightboxCounter()?.textContent?.trim()).toBe(
        `3 / ${LDF_PROJECTS_SELLER.gallery.length}`,
      );

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await fixture.whenStable();
      expect(lightboxCounter()?.textContent?.trim()).toBe(
        `2 / ${LDF_PROJECTS_SELLER.gallery.length}`,
      );

      // Move to last image
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await fixture.whenStable();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await fixture.whenStable();

      expect(lightboxCounter()?.textContent?.trim()).toBe(
        `${LDF_PROJECTS_SELLER.gallery.length} / ${LDF_PROJECTS_SELLER.gallery.length}`,
      );
      expect(nextButton()?.disabled).toBe(true);
      expect(prevButton()?.disabled).toBe(false);
    });

    it('closes when clicking the backdrop, but stays open when clicking the image or controls', async () => {
      expandButtons()[0].click();
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
