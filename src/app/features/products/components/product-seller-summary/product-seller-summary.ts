import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProductDetailSeller } from '../../models/product-detail.model';
import { ProductAsset } from '../../directives/product-asset';
import { Button } from '../../../../shared/ui/button/button';

@Component({
  selector: 'app-product-seller-summary',
  imports: [Button, ProductAsset],
  templateUrl: './product-seller-summary.html',
  styleUrl: './product-seller-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSellerSummary {
  readonly seller = input.required<ProductDetailSeller>();
  readonly profileRequest = output<void>();
}
