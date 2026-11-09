import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductDetail } from '../../models/product-detail.model';
import { ProductAsset } from '../../directives/product-asset';

@Component({
  selector: 'app-product-summary',
  imports: [RouterLink, ProductAsset],
  templateUrl: './product-summary.html',
  styleUrl: './product-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSummary {
  readonly detail = input.required<ProductDetail>();
  protected readonly overviewHighlights = computed(() =>
    this.detail().highlights.filter((highlight) => highlight.overview !== false),
  );
}
