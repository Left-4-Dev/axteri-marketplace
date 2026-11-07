import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProductDetail } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.html',
  styleUrl: './product-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSummary {
  readonly detail = input.required<ProductDetail>();
}
