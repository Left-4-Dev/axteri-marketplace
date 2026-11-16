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
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { SellerProfile } from '../../models/seller-profile.model';
import { ProductAsset } from '../../../products/directives/product-asset';
import { horizontalScrollState } from '../../../../shared/utils/horizontal-scroll-state';

@Component({
  selector: 'app-seller-about',
  imports: [ProductAsset],
  templateUrl: './seller-about.html',
  styleUrl: './seller-about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onDocumentKeydown($event)' },
})
export class SellerAbout {
  readonly seller = input.required<SellerProfile>();

  private readonly viewport = viewChild<ElementRef<HTMLUListElement>>('viewport');
  private readonly lightbox = viewChild<ElementRef<HTMLDialogElement>>('lightbox');
  private readonly lightboxClose = viewChild<ElementRef<HTMLButtonElement>>('lightboxClose');
  private readonly lightboxPrevious = viewChild<ElementRef<HTMLButtonElement>>('lightboxPrevious');
  private readonly lightboxNext = viewChild<ElementRef<HTMLButtonElement>>('lightboxNext');
  private readonly expandButtons = viewChildren<ElementRef<HTMLButtonElement>>('expandButton');
  private readonly document = inject(DOCUMENT);

  private readonly scrollState = horizontalScrollState(
    () => this.viewport()?.nativeElement,
    () => this.seller().gallery,
  );
  protected readonly canPrevious = this.scrollState.canScrollPrev;
  protected readonly canNext = this.scrollState.canScrollNext;

  protected readonly selectedIndex = signal(0);
  protected readonly lightboxOpen = signal(false);
  protected readonly selectedImage = computed(
    () => this.seller().gallery[this.selectedIndex()] ?? '',
  );

  private previousOverflow: string | null = null;

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.lightbox()?.nativeElement;
      if (dialog) this.presentLightbox(dialog);
    });
    inject(DestroyRef).onDestroy(() => this.unlockScroll());
  }

  protected scroll(direction: -1 | 1): void {
    if (direction === -1 ? !this.canPrevious() : !this.canNext()) return;
    const viewport = this.viewport()?.nativeElement;
    if (!viewport) return;
    const items = viewport.querySelectorAll<HTMLElement>('.seller-about__item');
    if (items.length < 2) return;
    const step = items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
    const target = Math.round(viewport.scrollLeft / step) + direction;
    viewport.scrollTo({
      left: target * step,
      behavior: this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }

  protected openLightbox(index: number): void {
    this.selectedIndex.set(index);
    this.lightboxOpen.set(true);
    this.lockScroll();
  }

  protected closeLightbox(): void {
    if (!this.lightboxOpen()) return;
    const dialog = this.lightbox()?.nativeElement;
    if (dialog && typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    }
    this.lightboxOpen.set(false);
    this.unlockScroll();
    const trigger = this.expandButtons()?.[this.selectedIndex()]?.nativeElement;
    trigger?.focus();
  }

  protected showLightboxImage(step: -1 | 1): void {
    const target = this.selectedIndex() + step;
    if (target < 0 || target >= this.seller().gallery.length) return;
    this.selectedIndex.set(target);

    const active = this.document.activeElement;
    const edge = step === 1 ? this.lightboxNext() : this.lightboxPrevious();
    const opposite = step === 1 ? this.lightboxPrevious() : this.lightboxNext();
    const reachedEdge = step === 1 ? target === this.seller().gallery.length - 1 : target === 0;
    if (reachedEdge && active === edge?.nativeElement) opposite?.nativeElement.focus();
  }

  protected onLightboxClick(event: MouseEvent): void {
    if (!(event.target as Element).closest('button, img, .seller-about__lightbox-counter')) {
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
}
