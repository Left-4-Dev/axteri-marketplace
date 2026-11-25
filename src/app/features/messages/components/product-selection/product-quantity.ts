import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-message-product-quantity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-quantity.html',
  styleUrl: './product-quantity.scss',
})
export class ProductQuantity {
  readonly name = input.required<string>();
  readonly quantity = input.required<number>();
  readonly quantityChange = output<number>();
}
