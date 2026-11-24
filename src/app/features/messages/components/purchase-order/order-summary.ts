import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { PurchaseOrder } from '../../models/messages.model';
import { formatCurrencyEsPe } from '../../utils/messages-format';
import { OrderDetail } from './order-detail';

@Component({
  selector: 'app-order-summary',
  imports: [OrderDetail],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
})
export class OrderSummary {
  readonly order = input.required<PurchaseOrder>();
  protected readonly detailOpen = signal(false);
  protected readonly formatCurrency = formatCurrencyEsPe;
}
