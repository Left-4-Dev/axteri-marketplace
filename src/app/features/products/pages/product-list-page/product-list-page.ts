import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../models/product.model';
import { ProductCard, ProductCardVariant } from '../../../../shared/ui/product-card/product-card';
import { PRODUCT_LISTING_ITEMS, PRODUCT_LISTING_SUMMARY } from '../../data/product-listing.data';
import { ProductListingSummary, ProductViewMode } from '../../models/product-listing.model';

@Component({
  selector: 'app-product-list-page',
  imports: [RouterLink, ProductCard],
  templateUrl: './product-list-page.html',
  styleUrl: './product-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage {
  readonly products = input<readonly Product[]>(PRODUCT_LISTING_ITEMS);
  readonly summary = input<ProductListingSummary>(PRODUCT_LISTING_SUMMARY);

  protected readonly viewMode = signal<ProductViewMode>('grid');
  protected readonly cardVariant = computed<ProductCardVariant>(() =>
    this.viewMode() === 'list' ? 'list' : 'default',
  );

  protected setViewMode(mode: ProductViewMode): void {
    this.viewMode.set(mode);
  }

  protected onRequestQuote(): void {
    // Handler local reservado para la futura integración de cotización.
  }

  protected onViewDetails(): void {
    // Handler local reservado para la futura navegación/contacto de proveedor.
  }
}
