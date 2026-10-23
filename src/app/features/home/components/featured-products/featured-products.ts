import { Component, input } from '@angular/core';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';

@Component({
  selector: 'app-featured-products',
  imports: [ProductCard],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
})
export class FeaturedProducts {
  readonly products = input.required<readonly Product[]>();
}
