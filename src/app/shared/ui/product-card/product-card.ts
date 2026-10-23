import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, NgOptimizedImage],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly requestQuote = output<Product>();
  readonly viewDetails = output<Product>();
}
