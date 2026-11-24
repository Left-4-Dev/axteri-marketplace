import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { PurchaseOrder } from '../../models/messages.model';
import { formatCurrencyEsPe } from '../../utils/messages-format';

@Component({
  selector: 'app-order-detail',
  imports: [DatePipe],
  host: { '(keydown.escape)': '$event.stopPropagation()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail {
  readonly order = input.required<PurchaseOrder>();
  readonly dismissed = output<void>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    const body = inject(DOCUMENT).body;
    const previous = body.style.overflow;
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      body.style.overflow = 'hidden';
      dialog.querySelector('button')?.focus();
    });
    inject(DestroyRef).onDestroy(() => {
      body.style.overflow = previous;
    });
  }

  protected close(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    this.dismissed.emit();
  }
  protected money(cents: number): string {
    return formatCurrencyEsPe(cents / 100, this.order().currency);
  }
}
