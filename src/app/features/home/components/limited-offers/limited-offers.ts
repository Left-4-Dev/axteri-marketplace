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
  selector: 'app-limited-offers',
  imports: [ProductCard],
  templateUrl: './limited-offers.html',
  styleUrl: './limited-offers.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LimitedOffers {
  readonly products = input.required<readonly Product[]>();
  private readonly viewport = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  private readonly document = inject(DOCUMENT);
  private readonly scrollState = horizontalScrollState(
    () => this.viewport()?.nativeElement,
    () => this.products(),
  );
  protected readonly canGoBack = this.scrollState.canScrollPrev;
  protected readonly canGoForward = this.scrollState.canScrollNext;

  protected move(direction: -1 | 1): void {
    if (direction === -1 ? !this.canGoBack() : !this.canGoForward()) return;
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
