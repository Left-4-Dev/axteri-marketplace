import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { ConversationProduct } from '../../models/messages.model';

@Component({
  selector: 'app-message-product-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-summary.html',
  styleUrl: './product-summary.scss',
})
export class MessageProductSummary {
  readonly product = input.required<ConversationProduct>();
  readonly compact = input(false);
  protected readonly image = linkedSignal(() => this.product().imageUrl);
}
