import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';

@Component({
  selector: 'app-seller-products',
  imports: [ProductCard, RouterLink],
  templateUrl: './seller-products.html',
  styleUrl: './seller-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerProducts {
  readonly products = input.required<readonly Product[]>();
}
