import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Category } from '../../models/home-content.model';

@Component({
  selector: 'app-categories',
  imports: [NgOptimizedImage],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories {
  readonly categories = input.required<readonly Category[]>();
  protected readonly canGoBack = signal(false);
  protected readonly canGoForward = signal(false);
  private readonly viewport = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  private readonly list = viewChild.required<ElementRef<HTMLUListElement>>('list');
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterRenderEffect({
      read: () => {
        this.categories();
        this.updateControls();
      },
    });
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.updateControls());
      observer.observe(this.viewport().nativeElement);
      observer.observe(this.list().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected updateControls(): void {
    const viewport = this.viewport().nativeElement;
    const end = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    // Allow for fractional layout/scroll rounding at either edge.
    this.canGoBack.set(end > 1 && viewport.scrollLeft > 1);
    this.canGoForward.set(viewport.scrollLeft < end - 1);
  }

  protected move(direction: -1 | 1): void {
    if (direction === -1 ? !this.canGoBack() : !this.canGoForward()) return;
    const list = this.list().nativeElement;
    const window = this.document.defaultView;
    const gap = window ? parseFloat(window.getComputedStyle(list).columnGap) || 0 : 0;
    this.viewport().nativeElement.scrollBy({
      // Advance by the visible columns; the browser clamps the last, incomplete page.
      left: direction * (list.clientWidth + gap),
      behavior: window?.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (
      event.target !== this.viewport().nativeElement ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }
}
