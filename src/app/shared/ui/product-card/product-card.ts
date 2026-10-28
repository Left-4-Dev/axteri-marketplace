import { CurrencyPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, DecimalPipe, NgOptimizedImage],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss', './product-card-offer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly variant = input<'default' | 'offer'>('default');
  readonly requestQuote = output<Product>();
  readonly viewDetails = output<Product>();

  protected readonly discountPercent = computed(() => {
    const price = this.product().price;
    if (price.kind !== 'fixed' || !price.previousAmount || price.previousAmount <= price.amount) {
      return null;
    }
    // Display the reduction implied by the supplied prices; never assume a campaign discount.
    return Math.round(((price.previousAmount - price.amount) / price.previousAmount) * 1000) / 10;
  });
  protected readonly countdownParts = computed(() => {
    const countdown = this.product().offer?.countdown;
    if (!countdown) return [];
    return [
      { value: countdown.days, unit: 'd', label: 'días' },
      { value: countdown.hours, unit: 'h', label: 'horas' },
      { value: countdown.minutes, unit: 'm', label: 'minutos' },
      { value: countdown.seconds, unit: 's', label: 'segundos' },
    ].map((part) => ({ ...part, text: String(part.value).padStart(2, '0') }));
  });
  protected readonly countdownLabel = computed(
    () =>
      'Tiempo restante de ejemplo: ' +
      this.countdownParts()
        .map((p) => `${p.value} ${p.label}`)
        .join(', '),
  );
}
