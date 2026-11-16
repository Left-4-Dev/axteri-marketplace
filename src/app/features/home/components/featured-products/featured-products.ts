import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { horizontalScrollState } from '../../../../shared/utils/horizontal-scroll-state';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';

@Component({
  selector: 'app-featured-products',
  imports: [ProductCard],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProducts {
  readonly products = input.required<readonly Product[]>();
  private readonly viewport = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  private readonly list = viewChild.required<ElementRef<HTMLUListElement>>('list');
  private readonly document = inject(DOCUMENT);
  private readonly scrollState = horizontalScrollState(
    () => this.viewport()?.nativeElement,
    () => this.products(),
  );
  protected readonly canGoBack = this.scrollState.canScrollPrev;
  protected readonly canGoForward = this.scrollState.canScrollNext;

  protected move(direction: -1 | 1): void {
    const viewport = this.viewport().nativeElement;
    if (direction === -1 ? !this.canGoBack() : !this.canGoForward()) return;
    const list = this.list().nativeElement;
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
