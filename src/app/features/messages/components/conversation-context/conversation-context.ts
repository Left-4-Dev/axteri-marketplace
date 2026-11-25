import { SharedFiles } from '../shared-files/shared-files';
import { OrderSummary } from '../purchase-order/order-summary';
import { PurchaseOrder } from '../../models/messages.model';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { ProductCatalog } from '../product-selection/product-catalog';
import {
  ConversationContextMode,
  ConversationContextTab,
  ConversationSeller,
} from '../../models/messages.model';
import { ConversationSellerInfo } from './conversation-seller-info';

export interface ContextTabOption {
  readonly id: ConversationContextTab;
  readonly label: string;
}

@Component({
  selector: 'app-conversation-context',
  imports: [SharedFiles, OrderSummary, ProductCatalog, Button, ConversationSellerInfo],
  templateUrl: './conversation-context.html',
  styleUrl: './conversation-context.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationContext {
  readonly orders = input.required<ReadonlyMap<string, PurchaseOrder>>();
  readonly seller = input<ConversationSeller | null>(null);
  readonly selectionCount = input(0);
  readonly activeTab = input<ConversationContextTab>('products');
  readonly mode = input<ConversationContextMode>('tabs');

  readonly tabChange = output<ConversationContextTab>();
  readonly backToTabs = output<void>();
  readonly closeContext = output<void>();

  protected readonly tabs: readonly ContextTabOption[] = [
    { id: 'products', label: 'Productos' },
    { id: 'files', label: 'Archivos' },
    { id: 'orders', label: 'Órdenes' },
  ];

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  protected selectTab(tab: ConversationContextTab): void {
    this.tabChange.emit(tab);
  }

  protected onTabKeydown(event: KeyboardEvent, index: number): void {
    const count = this.tabs.length;
    let target: number;
    switch (event.key) {
      case 'ArrowRight':
        target = (index + 1) % count;
        break;
      case 'ArrowLeft':
        target = (index - 1 + count) % count;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.selectTab(this.tabs[target].id);
    this.tabButtons()[target].nativeElement.focus();
  }
}
