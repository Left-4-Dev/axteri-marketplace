import { Component, input } from '@angular/core';
import { Product } from '../../../../models/product.model';
import { ProductCard } from '../../../../shared/ui/product-card/product-card';

@Component({
  selector: 'app-limited-offers',
  imports: [ProductCard],
  templateUrl: './limited-offers.html',
  styleUrl: './limited-offers.scss',
})
export class LimitedOffers {
  readonly products = input.required<readonly Product[]>();
}
