import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PRODUCT_DETAIL_SECTIONS } from '../../data/product-sections.data';

@Component({
  selector: 'app-product-section-nav',
  templateUrl: './product-section-nav.html',
  styleUrl: './product-section-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSectionNav {
  readonly productId = input.required<string>();
  protected readonly sections = PRODUCT_DETAIL_SECTIONS;
  // Un href con solo # se resolvería contra <base href="/">, no contra esta ficha.
  // Mantener enlaces nativos; la página compensa el scroll adicional del Router.
  protected readonly productPath = computed(
    () => `/productos/${encodeURIComponent(this.productId())}`,
  );
}
