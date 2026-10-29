import { NgOptimizedImage } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { Brand } from '../../models/home-content.model';

@Component({
  selector: 'app-preferred-brands',
  imports: [NgOptimizedImage, Button],
  templateUrl: './preferred-brands.html',
  styleUrl: './preferred-brands.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferredBrands {
  readonly brands = input.required<readonly Brand[]>();
  protected readonly scrollableBrands = signal<ReadonlySet<string>>(new Set());
  private readonly viewports = viewChildren<ElementRef<HTMLDivElement>>('categoriesViewport');
  private readonly document = inject(DOCUMENT);

  constructor() {
    afterRenderEffect({
      read: (onCleanup) => {
        this.brands();
        const viewports = this.viewports().map((ref) => ref.nativeElement);
        const updateOverflow = () => {
          const ids = new Set(
            viewports
              .filter((viewport) => viewport.scrollWidth > viewport.clientWidth + 1)
              .map((viewport) => viewport.dataset['brandId']!),
          );
          this.scrollableBrands.update((previous) =>
            previous.size === ids.size && [...ids].every((id) => previous.has(id)) ? previous : ids,
          );
        };
        updateOverflow();
        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(updateOverflow);
        for (const viewport of viewports) {
          observer.observe(viewport);
          // Observe intrinsic chip widths too, including changes when Exo finishes loading.
          if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
        }
        onCleanup(() => observer.disconnect());
      },
    });
  }

  protected onCategoriesKeydown(event: KeyboardEvent, viewport: HTMLDivElement): void {
    if (
      event.target !== viewport ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      viewport.scrollWidth <= viewport.clientWidth + 1
    )
      return;

    const behavior: ScrollBehavior = this.document.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
      ? 'instant'
      : 'smooth';
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      viewport.scrollBy({
        left: (event.key === 'ArrowLeft' ? -1 : 1) * viewport.clientWidth * 0.75,
        behavior,
      });
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      viewport.scrollTo({ left: event.key === 'Home' ? 0 : viewport.scrollWidth, behavior });
    }
  }
}
