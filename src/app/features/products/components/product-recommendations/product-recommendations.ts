import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';

@Component({
  selector: 'app-product-recommendations',
  imports: [ProductCard],
  templateUrl: './product-recommendations.html',
  styleUrl: './product-recommendations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductRecommendations {
  readonly products = input.required<readonly Product[]>();
}
