import { ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductGallery } from '../../components/product-gallery/product-gallery';
import { ProductSummary } from '../../components/product-summary/product-summary';
import { ProductPurchasePanel } from '../../components/product-purchase-panel/product-purchase-panel';
import { ProductRecommendations } from '../../components/product-recommendations/product-recommendations';
import { ProductSectionNav } from '../../components/product-section-nav/product-section-nav';
import { ProductSpecifications } from '../../components/product-specifications/product-specifications';
import { ProductDescription } from '../../components/product-description/product-description';
import { ProductDocuments } from '../../components/product-documents/product-documents';
import { ProductAccessories } from '../../components/product-accessories/product-accessories';
import { ProductVariants } from '../../components/product-variants/product-variants';
import { PRODUCT_DETAILS } from '../../data/product-detail.data';
import { PRODUCT_DETAIL_RECOMMENDATIONS } from '../../data/product-recommendations.data';
import { PRODUCT_DETAIL_SECTIONS } from '../../data/product-sections.data';
import { ProductPurchaseIntent } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    RouterLink,
    ProductGallery,
    ProductSummary,
    ProductPurchasePanel,
    ProductRecommendations,
    ProductSectionNav,
    ProductSpecifications,
    ProductDescription,
    ProductDocuments,
    ProductAccessories,
    ProductVariants,
  ],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  protected readonly detail = computed(() =>
    PRODUCT_DETAILS.find((item) => item.id === this.params().get('id')),
  );
  protected readonly purchaseMessage = signal('');
  protected readonly recommendations = PRODUCT_DETAIL_RECOMMENDATIONS;
  protected readonly sections = PRODUCT_DETAIL_SECTIONS;

  constructor() {
    const scroller = inject(ViewportScroller);
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    // El Router también procesa los cambios de hash y no lee scroll-margin.
    // Compensar solo durante esta ficha, con el mismo margen responsive del CSS.
    scroller.setOffset(() => {
      const anchor = host.nativeElement.querySelector('.product-detail__section-anchor');
      const view = anchor?.ownerDocument.defaultView;
      return [
        0,
        anchor && view ? parseFloat(view.getComputedStyle(anchor).scrollMarginTop) || 0 : 0,
      ];
    });
    inject(DestroyRef).onDestroy(() => scroller.setOffset([0, 0]));
  }

  protected onPurchaseIntent(intent: ProductPurchaseIntent): void {
    const action =
      intent.kind === 'contact' ? 'El contacto con el proveedor' : 'La solicitud de cotización';
    this.purchaseMessage.set(
      `${action} para ${intent.quantity} unidad(es) estará disponible próximamente. No se ha enviado ninguna solicitud.`,
    );
  }
}
