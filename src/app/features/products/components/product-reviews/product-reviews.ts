import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProductReviewsData } from '../../models/product-detail.model';

export interface ProductRatingDistributionRow {
  readonly stars: number;
  readonly count: number;
  readonly percentage: number;
}

const STAR_LEVELS_DESC = [5, 4, 3, 2, 1] as const;
const STAR_SCALE = [1, 2, 3, 4, 5] as const;

const REVIEW_DATE_FORMATTER = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

@Component({
  selector: 'app-product-reviews',
  imports: [DecimalPipe],
  templateUrl: './product-reviews.html',
  styleUrl: './product-reviews.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductReviews {
  readonly reviews = input.required<ProductReviewsData>();

  protected readonly starScale = STAR_SCALE;

  protected readonly hasReviews = computed(() => this.reviews().items.length > 0);

  // El total se deriva de la distribución como única fuente de verdad (con respaldo en items).
  protected readonly totalReviews = computed(() => {
    const data = this.reviews();
    if (!data.items.length) {
      return 0;
    }
    const distributionTotal = data.distribution.reduce(
      (sum, entry) => sum + Math.max(0, entry.count),
      0,
    );
    return distributionTotal > 0 ? distributionTotal : data.items.length;
  });

  protected readonly averageRating = computed(() => {
    if (!this.hasReviews()) {
      return 0;
    }
    const raw = this.reviews().average;
    return Number.isFinite(raw) ? Math.min(5, Math.max(0, raw)) : 0;
  });

  protected readonly roundedAverage = computed(() => Math.round(this.averageRating()));

  protected readonly distributionRows = computed<readonly ProductRatingDistributionRow[]>(() => {
    const total = this.totalReviews();
    const countsByStar = new Map<number, number>();
    for (const entry of this.reviews().distribution) {
      countsByStar.set(entry.stars, Math.max(0, entry.count));
    }
    return STAR_LEVELS_DESC.map((stars) => {
      const count = countsByStar.get(stars) ?? 0;
      const percentage =
        total > 0 ? Math.min(100, Math.max(0, Math.round((count / total) * 100))) : 0;
      return { stars, count, percentage };
    });
  });

  protected clampRating(rating: number): number {
    return Number.isFinite(rating) ? Math.min(5, Math.max(0, Math.round(rating))) : 0;
  }

  protected formatDate(isoDate: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
    const parsed = match
      ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
      : new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return isoDate;
    }
    return REVIEW_DATE_FORMATTER.format(parsed);
  }
}
