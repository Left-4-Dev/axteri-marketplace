import { Component, input } from '@angular/core';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';

@Component({
  selector: 'app-recommendations',
  imports: [ProductCard],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.scss',
})
export class Recommendations {
  readonly products = input.required<readonly Product[]>();
}
