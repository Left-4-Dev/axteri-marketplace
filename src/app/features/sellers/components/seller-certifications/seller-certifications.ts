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
import { SellerCertification } from '../../models/seller-profile.model';

@Component({
  selector: 'app-seller-certifications',
  imports: [ProductAsset],
  templateUrl: './seller-certifications.html',
  styleUrl: './seller-certifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerCertifications {
  readonly certifications = input.required<readonly SellerCertification[]>();
  private readonly viewport = viewChild.required<ElementRef<HTMLUListElement>>('viewport');
  private readonly document = inject(DOCUMENT);
  private readonly scrollState = horizontalScrollState(
    () => this.viewport().nativeElement,
    () => this.certifications(),
  );
  protected readonly canPrevious = this.scrollState.canScrollPrev;
  protected readonly canNext = this.scrollState.canScrollNext;

  protected scroll(direction: -1 | 1): void {
    if (direction === -1 ? !this.canPrevious() : !this.canNext()) return;
    const viewport = this.viewport().nativeElement;
    const items = viewport.children;
    if (items.length < 2) return;
    const step = items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
    viewport.scrollTo({
      left: (Math.round(viewport.scrollLeft / step) + direction) * step,
      behavior: this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }
}
