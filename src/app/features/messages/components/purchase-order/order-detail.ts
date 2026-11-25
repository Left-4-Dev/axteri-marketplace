import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PurchaseOrder } from '../../models/messages.model';
import { formatCurrencyEsPe } from '../../utils/messages-format';

import { MessageDialog } from '../../utils/message-dialog';

@Component({
  selector: 'app-order-detail',
  imports: [DatePipe, MessageDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail {
  readonly order = input.required<PurchaseOrder>();
  readonly dismissed = output<void>();
  readonly trigger = input.required<HTMLElement>();

  protected money(cents: number): string {
    return formatCurrencyEsPe(cents / 100, this.order().currency);
  }
}
