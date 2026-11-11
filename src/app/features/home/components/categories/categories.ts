import { NgOptimizedImage } from '@angular/common';
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
import { RouterLink } from '@angular/router';
import { Category } from '../../models/home-content.model';

@Component({
  selector: 'app-categories',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories {
  readonly categories = input.required<readonly Category[]>();
  private readonly viewport = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  private readonly list = viewChild.required<ElementRef<HTMLUListElement>>('list');
  private readonly document = inject(DOCUMENT);
  private readonly scrollState = horizontalScrollState(
    () => this.viewport()?.nativeElement,
    () => this.categories(),
  );
  protected readonly canGoBack = this.scrollState.canScrollPrev;
  protected readonly canGoForward = this.scrollState.canScrollNext;

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
