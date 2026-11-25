import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SharedResource } from '../../models/messages.model';

import { MessageDialog } from '../../utils/message-dialog';

const MARQUEE_SPEED_PX_PER_SEC = 36;
const MARQUEE_MIN_DURATION_SEC = 2.2;

@Component({
  selector: 'app-message-resource',
  imports: [DecimalPipe, MessageDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resource-item.html',
  styleUrl: './resource-item.scss',
})
export class ResourceItem {
  readonly resource = input.required<SharedResource>();
  readonly marquee = input(false);
  protected readonly previewOpen = signal(false);
  protected readonly marqueeOverflow = signal(0);
  protected readonly marqueePinned = signal(false);
  protected readonly marqueeDuration = computed(() => {
    const distance = this.marqueeOverflow();
    if (distance <= 0) return 0;
    return Math.max(
      MARQUEE_MIN_DURATION_SEC,
      Number((distance / MARQUEE_SPEED_PX_PER_SEC).toFixed(2)),
    );
  });

  private readonly marqueeHost = viewChild<ElementRef<HTMLElement>>('marqueeHost');
  private readonly marqueeTrack = viewChild<ElementRef<HTMLElement>>('marqueeTrack');

  constructor() {
    effect((onCleanup) => {
      const enabled = this.marquee();
      const name = this.resource().name;
      const host = this.marqueeHost()?.nativeElement;
      const track = this.marqueeTrack()?.nativeElement;

      if (!enabled || !name || !host || !track) {
        this.marqueeOverflow.set(0);
        this.marqueePinned.set(false);
        return;
      }

      const measure = () => {
        const overflow = Math.max(0, Math.ceil(track.scrollWidth - host.clientWidth));
        this.marqueeOverflow.set(overflow > 2 ? overflow : 0);
        if (overflow <= 2) this.marqueePinned.set(false);
      };

      const frame = requestAnimationFrame(measure);
      let observer: ResizeObserver | undefined;
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(measure);
        observer.observe(host);
      }

      onCleanup(() => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
      });
    });
  }

  protected toggleMarquee(): void {
    if (this.marquee() && this.marqueeOverflow() > 0) {
      this.marqueePinned.update((active) => !active);
    }
  }
}
