import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
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
} from '@angular/core';
import { ProductAsset } from '../../directives/product-asset';
import { ProductDocument } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-documents',
  imports: [NgTemplateOutlet, ProductAsset],
  templateUrl: './product-documents.html',
  styleUrl: './product-documents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDocuments {
  readonly documents = input.required<readonly ProductDocument[]>();

  protected readonly canGoBack = signal(false);
  protected readonly canGoForward = signal(false);
  protected readonly scrollable = computed(() => this.canGoBack() || this.canGoForward());
  private readonly viewport = viewChild<ElementRef<HTMLDivElement>>('viewport');
  private readonly list = viewChild<ElementRef<HTMLUListElement>>('list');
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterRenderEffect({
      read: () => {
        this.documents();
        this.updateControls();
      },
    });
    afterNextRender(() => {
      const viewport = this.viewport();
      if (typeof ResizeObserver === 'undefined' || !viewport) return;
      const observer = new ResizeObserver(() => this.updateControls());
      observer.observe(viewport.nativeElement);
      const list = this.list();
      if (list) observer.observe(list.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  // Evita presentar enlaces engañosos (#, vacíos o javascript:) cuando no existe archivo real.
  protected resolveHref(href: string | undefined): string | null {
    const trimmed = href?.trim();
    if (!trimmed || trimmed.startsWith('#') || /^javascript:/i.test(trimmed)) {
      return null;
    }
    return trimmed;
  }

  protected updateControls(): void {
    const viewport = this.viewport()?.nativeElement;
    if (!viewport) return;
    const end = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    // Allow for fractional layout/scroll rounding at either edge.
    this.canGoBack.set(end > 1 && viewport.scrollLeft > 1);
    this.canGoForward.set(viewport.scrollLeft < end - 1);
  }

  protected move(direction: -1 | 1): void {
    const viewport = this.viewport()?.nativeElement;
    const list = this.list()?.nativeElement;
    if (!viewport || !list || (direction === -1 ? !this.canGoBack() : !this.canGoForward())) return;
    const first = list.firstElementChild;
    if (!first) return;
    const window = this.document.defaultView;
    const gap = window ? parseFloat(window.getComputedStyle(list).columnGap) || 0 : 0;
    viewport.scrollBy({
      left: direction * (first.getBoundingClientRect().width + gap),
      behavior: this.scrollBehavior(),
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const viewport = this.viewport()?.nativeElement;
    if (!viewport || event.target !== viewport || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.move(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      viewport.scrollTo({
        left: event.key === 'Home' ? 0 : viewport.scrollWidth,
        behavior: this.scrollBehavior(),
      });
    }
  }

  private scrollBehavior(): ScrollBehavior {
    return this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth';
  }
}
