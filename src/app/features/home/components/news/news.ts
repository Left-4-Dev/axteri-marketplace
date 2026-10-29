import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Button } from '../../../../shared/ui/button/button';
import { NewsItem } from '../../models/home-content.model';

@Component({
  selector: 'app-news',
  imports: [Button],
  templateUrl: './news.html',
  styleUrl: './news.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class News {
  readonly items = input.required<readonly NewsItem[]>();
  protected readonly activeIndex = signal(0);
  private readonly track = viewChild<ElementRef<HTMLDivElement>>('track');
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  constructor() {
    afterRenderEffect((onCleanup) => {
      this.items();
      const track = this.track()?.nativeElement;
      // A replacement input starts at the first slide, including empty -> populated lists.
      this.activeIndex.set(0);
      if (!track) return;
      track.scrollLeft = 0;
      if (typeof ResizeObserver === 'undefined') return;
      let width = track.clientWidth;
      const observer = new ResizeObserver(() => {
        if (track.clientWidth === width) return;
        width = track.clientWidth;
        // Preserve the current slide when its width changes; resizing is never animated.
        track.scrollLeft = untracked(this.activeIndex) * width;
      });
      observer.observe(track);
      onCleanup(() => observer.disconnect());
    });
  }

  protected navigateTo(destination: string): void {
    void this.router.navigateByUrl(destination);
  }

  protected updateActiveSlide(): void {
    const track = this.track()?.nativeElement;
    if (!track?.clientWidth) return;
    this.activeIndex.set(
      Math.max(
        0,
        Math.min(this.items().length - 1, Math.round(track.scrollLeft / track.clientWidth)),
      ),
    );
  }

  protected goTo(index: number): void {
    const track = this.track()?.nativeElement;
    if (!track || this.items().length < 2) return;
    const target = Math.max(0, Math.min(this.items().length - 1, index));
    track.scrollTo({
      left: target * track.clientWidth,
      behavior: this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (
      event.target !== this.track()?.nativeElement ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.shiftKey ||
      this.items().length < 2
    )
      return;
    let target: number;
    switch (event.key) {
      case 'ArrowLeft':
        target = this.activeIndex() - 1;
        break;
      case 'ArrowRight':
        target = this.activeIndex() + 1;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = this.items().length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.goTo(target);
  }
}
