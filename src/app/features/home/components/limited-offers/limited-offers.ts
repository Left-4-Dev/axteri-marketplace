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
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';

@Component({
  selector: 'app-limited-offers',
  imports: [ProductCard],
  templateUrl: './limited-offers.html',
  styleUrl: './limited-offers.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LimitedOffers {
  readonly products = input.required<readonly Product[]>();
  protected readonly canGoBack = signal(false);
  protected readonly canGoForward = signal(false);
  private readonly viewport = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterRenderEffect({
      read: () => {
        this.products();
        this.updateControls();
      },
    });
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.updateControls());
      observer.observe(this.viewport().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected updateControls(): void {
    const viewport = this.viewport().nativeElement;
    const end = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    this.canGoBack.set(viewport.scrollLeft > 1);
    this.canGoForward.set(viewport.scrollLeft < end - 1);
  }

  protected move(direction: -1 | 1): void {
    const viewport = this.viewport().nativeElement;
    const first = viewport.querySelector('li');
    const list = viewport.querySelector('ul');
    if (!first || !list) return;
    const window = this.document.defaultView;
    const gap = window ? parseFloat(window.getComputedStyle(list).columnGap) || 0 : 0;
    viewport.scrollBy({
      left: direction * (first.getBoundingClientRect().width + gap),
      behavior: this.scrollBehavior(),
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.target !== this.viewport().nativeElement) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.move(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const viewport = this.viewport().nativeElement;
      viewport.scrollTo({
        left: event.key === 'Home' ? 0 : viewport.scrollWidth,
        behavior: this.scrollBehavior(),
      });
    }
  }

  private scrollBehavior(): ScrollBehavior {
    return this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth';
  }
}
