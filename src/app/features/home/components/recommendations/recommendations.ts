import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';

const PRODUCTS_PER_BATCH = 10;

@Component({
  selector: 'app-recommendations',
  imports: [ProductCard],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Recommendations {
  readonly products = input.required<readonly Product[]>();
  readonly visibleCount = signal(PRODUCTS_PER_BATCH);
  readonly visibleProducts = computed(() => this.products().slice(0, this.visibleCount()));
  readonly hasMoreProducts = computed(() => this.products().length > this.visibleCount());

  loadMore(): void {
    this.visibleCount.update((count) =>
      Math.min(count + PRODUCTS_PER_BATCH, this.products().length),
    );
  }
}
