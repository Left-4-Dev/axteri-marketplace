import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';

@Component({
  selector: 'app-product-accessories',
  imports: [ProductCard],
  templateUrl: './product-accessories.html',
  styleUrl: './product-accessories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAccessories {
  readonly accessories = input.required<readonly Product[]>();
  readonly requestQuote = output<Product>();
  readonly viewDetails = output<Product>();
}
