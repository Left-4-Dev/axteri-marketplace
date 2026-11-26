import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { CommercialDetail, ProductPurchaseIntent } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-purchase-panel',
  imports: [Button, CurrencyPipe, RouterLink],
  templateUrl: './product-purchase-panel.html',
  styleUrl: './product-purchase-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPurchasePanel {
  readonly detail = input.required<CommercialDetail>();
  readonly purchaseIntent = output<ProductPurchaseIntent>();
  readonly shippingAddressChangeRequest = output<void>();
  protected readonly quantity = signal(1);

  selectedQuantity(): number {
    return this.quantity();
  }

  protected request(kind: ProductPurchaseIntent['kind']): void {
    const { id: productId, sellerId, sku } = this.detail();
    this.purchaseIntent.emit({ kind, productId, sellerId, sku, quantity: this.quantity() });
  }
  protected setQuantity(value: number): void {
    this.quantity.set(
      Number.isFinite(value)
        ? Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value)))
        : 1,
    );
  }

  protected normalizeQuantity(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setQuantity(input.valueAsNumber);
    input.value = String(this.quantity());
  }
}
