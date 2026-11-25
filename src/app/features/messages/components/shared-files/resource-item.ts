import {
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
import { DecimalPipe } from '@angular/common';
import { SharedResource } from '../../models/messages.model';

@Component({
  selector: 'app-message-resource',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resource-item.html',
  styleUrl: './resource-item.scss',
  host: { '(keydown.escape)': 'stopPreviewEscape($event)' },
})
export class ResourceItem {
  readonly resource = input.required<SharedResource>();
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly preview = viewChild<ElementRef<HTMLDialogElement>>('preview');
  private readonly body = inject(DOCUMENT).body;
  private previousOverflow: string | null = null;
  protected readonly previewOpen = signal(false);

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.preview()?.nativeElement;
      if (!dialog || dialog.open) return;
      if (this.previousOverflow === null) {
        this.previousOverflow = this.body.style.overflow;
      }
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      this.body.style.overflow = 'hidden';
      dialog.querySelector<HTMLButtonElement>('.close')?.focus();
    });

    inject(DestroyRef).onDestroy(() => {
      this.restoreBodyScroll();
    });
  }

  protected closePreview(): void {
    const dialog = this.preview()?.nativeElement;
    if (dialog?.open && typeof dialog.close === 'function') dialog.close();
    this.onPreviewClosed();
  }

  protected onPreviewClosed(): void {
    this.restoreBodyScroll();
    if (!this.previewOpen()) return;
    this.previewOpen.set(false);
    this.trigger()?.nativeElement.focus();
  }

  protected stopPreviewEscape(event: Event): void {
    if (this.preview()?.nativeElement.open) event.stopPropagation();
  }

  private restoreBodyScroll(): void {
    if (this.previousOverflow === null) return;
    this.body.style.overflow = this.previousOverflow;
    this.previousOverflow = null;
  }
}
