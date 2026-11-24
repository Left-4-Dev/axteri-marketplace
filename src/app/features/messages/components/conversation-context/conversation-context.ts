import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
  imports: [ProductCatalog, Button, ConversationSellerInfo],
  templateUrl: './conversation-context.html',
  styleUrl: './conversation-context.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationContext {
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

  protected selectTab(tab: ConversationContextTab): void {
    this.tabChange.emit(tab);
  }

  protected onTabKeydown(event: KeyboardEvent, index: number): void {
    const count = this.tabs.length;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = this.tabs[(index + 1) % count];
      this.selectTab(next.id);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = this.tabs[(index - 1 + count) % count];
      this.selectTab(prev.id);
    }
  }
}
