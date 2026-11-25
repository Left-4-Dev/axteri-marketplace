import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessagesStore } from '../../stores/messages.store';
import { MessageProductSummary } from './product-summary';
import { ProductQuantity } from './product-quantity';

@Component({
  selector: 'app-message-product-catalog',
  imports: [MessageProductSummary, ProductQuantity],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.scss',
})
export class ProductCatalog {
  protected readonly store = inject(MessagesStore);
}
