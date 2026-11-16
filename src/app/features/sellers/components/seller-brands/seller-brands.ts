import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { horizontalScrollState } from '../../../../shared/utils/horizontal-scroll-state';
import { ProductAsset } from '../../../products/directives/product-asset';
import { SellerBrand } from '../../models/seller-profile.model';

@Component({
  selector: 'app-seller-brands',
  imports: [ProductAsset],
  templateUrl: './seller-brands.html',
  styleUrl: './seller-brands.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerBrands {
  readonly brands = input.required<readonly SellerBrand[]>();
  private readonly viewport = viewChild.required<ElementRef<HTMLUListElement>>('viewport');
  private readonly document = inject(DOCUMENT);
  private readonly scrollState = horizontalScrollState(
    () => this.viewport().nativeElement,
    () => this.brands(),
  );
  protected readonly canPrevious = this.scrollState.canScrollPrev;
  protected readonly canNext = this.scrollState.canScrollNext;

  protected scroll(direction: -1 | 1): void {
    if (direction === -1 ? !this.canPrevious() : !this.canNext()) return;
    const viewport = this.viewport().nativeElement;
    viewport.scrollBy({
      left: direction * viewport.clientWidth,
      behavior: this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }
}
