import {
  afterNextRender,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

// Píxeles de scroll vertical antes de mostrar el buscador compacto.
export const HEADER_SCROLL_THRESHOLD = 48;

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss', './header-responsive.scss', './header-motion.scss'],
})
export class Header {
  readonly primarySearchRequested = output<void>();

  protected readonly scrolled = signal(false);
  protected readonly searchAttention = signal(false);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly searchButton = viewChild.required<ElementRef<HTMLButtonElement>>('searchButton');

  constructor() {
    afterNextRender(() => {
      const window = this.document.defaultView;
      if (!window) return;

      const updateScroll = () => {
        const next = window.scrollY > HEADER_SCROLL_THRESHOLD;
        if (!next && this.document.activeElement === this.searchInput().nativeElement) {
          this.searchButton().nativeElement.focus({ preventScroll: true });
        }
        this.scrolled.set(next);
      };

      updateScroll();
      window.addEventListener('scroll', updateScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', updateScroll));
    });
  }

  protected requestSearch(): void {
    if (this.scrolled()) {
      this.searchInput().nativeElement.focus({ preventScroll: true });
      return;
    }

    if (this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.primarySearchRequested.emit();
      return;
    }

    this.searchAttention.set(true);
  }

  protected finishSearchAttention(event: AnimationEvent): void {
    if (!event.animationName.endsWith('header-search-bounce') || !this.searchAttention()) return;
    this.searchAttention.set(false);
    this.primarySearchRequested.emit();
  }
}
