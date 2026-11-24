import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { horizontalScrollState } from '../../../../shared/utils/horizontal-scroll-state';
import { MessagesStore } from '../../stores/messages.store';
import { MessageProductSummary } from './product-summary';
import { ProductQuantity } from './product-quantity';

@Component({
  selector: 'app-product-selection-tray',
  imports: [MessageProductSummary, ProductQuantity],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selection-tray.html',
  styleUrl: './selection-tray.scss',
})
export class SelectionTray {
  protected readonly store = inject(MessagesStore);
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  protected readonly scroll = horizontalScrollState(
    () => this.viewport().nativeElement,
    this.store.selection,
  );
  protected move(direction: number) {
    const el = this.viewport().nativeElement;
    el.scrollBy({ left: direction * el.clientWidth });
  }
}
