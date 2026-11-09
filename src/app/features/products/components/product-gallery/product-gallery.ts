import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  output,
  linkedSignal,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ProductDetail, ProductImage } from '../../models/product-detail.model';
import { ProductAsset } from '../../directives/product-asset';

@Component({
  selector: 'app-product-gallery',
  imports: [ProductAsset],
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onDocumentKeydown($event)' },
})
export class ProductGallery {
  readonly images = input.required<readonly [ProductImage, ...ProductImage[]]>();
  readonly icons = input<ProductDetail['galleryIcons']>();
  readonly imageViewRequest = output<ProductImage>();
  private readonly thumbnails = viewChildren<ElementRef<HTMLButtonElement>>('thumbnail');
  private readonly expandButton = viewChild<ElementRef<HTMLButtonElement>>('expandButton');
  private readonly lightbox = viewChild<ElementRef<HTMLDialogElement>>('lightbox');
  private readonly lightboxClose = viewChild<ElementRef<HTMLButtonElement>>('lightboxClose');
  private readonly lightboxPrevious = viewChild<ElementRef<HTMLButtonElement>>('lightboxPrevious');
  private readonly lightboxNext = viewChild<ElementRef<HTMLButtonElement>>('lightboxNext');
  private readonly document = inject(DOCUMENT);
  protected readonly selectedIndex = linkedSignal({ source: this.images, computation: () => 0 });
  protected readonly selectedImage = computed(() => this.images()[this.selectedIndex()]);
  protected readonly favorite = signal(false);
  protected readonly lightboxOpen = signal(false);
  private previousOverflow: string | null = null;

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.lightbox()?.nativeElement;
      if (dialog) this.presentLightbox(dialog);
    });
    inject(DestroyRef).onDestroy(() => this.unlockScroll());
  }

  protected nextImage(): void {
    this.selectedIndex.update((index) => (index + 1) % this.images().length);
    this.revealSelectedThumbnail();
  }

  protected openLightbox(): void {
    this.lightboxOpen.set(true);
    this.lockScroll();
    this.imageViewRequest.emit(this.selectedImage());
  }

  protected closeLightbox(): void {
    if (!this.lightboxOpen()) return;
    const dialog = this.lightbox()?.nativeElement;
    if (dialog && typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    }
    this.lightboxOpen.set(false);
    this.unlockScroll();
    this.expandButton()?.nativeElement.focus();
  }

  protected showLightboxImage(step: -1 | 1): void {
    const target = this.selectedIndex() + step;
    if (target < 0 || target >= this.images().length) return;
    this.selectedIndex.set(target);
    this.revealSelectedThumbnail();
    // A control about to become disabled must not take keyboard focus with it.
    const active = this.document.activeElement;
    const edge = step === 1 ? this.lightboxNext() : this.lightboxPrevious();
    const opposite = step === 1 ? this.lightboxPrevious() : this.lightboxNext();
    const reachedEdge = step === 1 ? target === this.images().length - 1 : target === 0;
    if (reachedEdge && active === edge?.nativeElement) opposite?.nativeElement.focus();
  }

  protected onLightboxClick(event: MouseEvent): void {
    // Only the backdrop and the empty area around the image close it.
    if (!(event.target as Element).closest('button, img, .product-gallery__lightbox-counter')) {
      this.closeLightbox();
    }
  }

  protected onLightboxCancel(event: Event): void {
    event.preventDefault();
    this.closeLightbox();
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (
      event.defaultPrevented ||
      !this.lightboxOpen() ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeLightbox();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.showLightboxImage(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Tab') {
      const dialog = this.lightbox()?.nativeElement;
      const focusable = dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled)'))
        : [];
      if (focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = this.document.activeElement as HTMLElement | null;
        if (event.shiftKey && (active === first || !dialog?.contains(active))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !dialog?.contains(active))) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  private presentLightbox(dialog: HTMLDialogElement): void {
    if (dialog.hasAttribute('open')) return;
    // showModal() puts the dialog in the top layer (above header and floating actions) and
    // makes the rest of the page inert; the attribute is a fallback for environments without it.
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    this.lockScroll();
    this.lightboxClose()?.nativeElement.focus();
  }

  private lockScroll(): void {
    const body = this.document?.body;
    if (!body || this.previousOverflow !== null) return;
    this.previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    const body = this.document?.body;
    if (!body || this.previousOverflow === null) return;
    body.style.overflow = this.previousOverflow;
    this.previousOverflow = null;
  }

  private revealSelectedThumbnail(): void {
    const button = this.thumbnails()[this.selectedIndex()]?.nativeElement;
    const rail = button?.parentElement;
    if (button && rail) {
      // Scroll the thumbnail strip only; do not move the page when selecting an image.
      if (rail.scrollHeight > rail.clientHeight) rail.scrollTop = button.offsetTop - rail.offsetTop;
      if (rail.scrollWidth > rail.clientWidth)
        rail.scrollLeft = button.offsetLeft - rail.offsetLeft;
    }
  }
}
