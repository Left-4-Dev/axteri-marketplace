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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductGallery } from '../../components/product-gallery/product-gallery';
import { ProductSummary } from '../../components/product-summary/product-summary';
import { ProductSellerSummary } from '../../components/product-seller-summary/product-seller-summary';
import { ProductPurchasePanel } from '../../components/product-purchase-panel/product-purchase-panel';
import { ProductRecommendations } from '../../components/product-recommendations/product-recommendations';
import { ProductSectionNav } from '../../components/product-section-nav/product-section-nav';
import { ProductSpecifications } from '../../components/product-specifications/product-specifications';
import { ProductDescription } from '../../components/product-description/product-description';
import { ProductDocuments } from '../../components/product-documents/product-documents';
import { ProductAccessories } from '../../components/product-accessories/product-accessories';
import { ProductVariants } from '../../components/product-variants/product-variants';
import { ProductReviews } from '../../components/product-reviews/product-reviews';
import { CatalogRepository } from '../../../../core/catalog/catalog.repository';
import { buildProductDetail } from '../../data/product-detail.factory';
import { PRODUCT_DETAIL_SECTIONS } from '../../data/product-sections.data';
import { ProductPurchaseIntent } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    RouterLink,
    ProductGallery,
    ProductSummary,
    ProductSellerSummary,
    ProductPurchasePanel,
    ProductRecommendations,
    ProductSectionNav,
    ProductSpecifications,
    ProductDescription,
    ProductDocuments,
    ProductAccessories,
    ProductVariants,
    ProductReviews,
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
  private readonly router = inject(Router);
  private readonly query = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  protected readonly category = computed(() => {
    const product = this.catalog.getProduct(this.params().get('id') ?? '');
    return product && this.catalog.getCategory(product.categoryId);
  });
  protected readonly catalog = inject(CatalogRepository);
  protected readonly detail = computed(() => {
    const p = this.catalog.getProduct(this.params().get('id') ?? '');
    return p && buildProductDetail(p);
  });
  protected readonly richDetail = computed(() => {
    const d = this.detail();
    return d && 'variants' in d ? d : undefined;
  });
  protected readonly purchaseDetail = computed(() => {
    const detail = this.detail();
    const variant = this.richDetail()?.variants.find((v) => v.sku === this.query().get('sku'));
    if (!variant || detail?.sku === variant.sku) return detail;
    const product = this.catalog.products().find((p) => p.sku === variant.sku);
    return product ? buildProductDetail(product) : detail;
  });
  protected selectSku(sku: string): void {
    if (this.query().get('sku') !== sku)
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { sku },
        queryParamsHandling: 'merge',
        preserveFragment: true,
      });
  }
  protected readonly purchaseMessage = signal('');
  // Keep the existing artwork in Variants; production gallery assets belong to the Overview.
  protected readonly variantFallbackImage = computed(() => {
    const image = this.richDetail()?.images[0];
    return image
      ? { src: image.fallbackSrc ?? image.src, alt: image.fallbackAlt ?? image.alt }
      : undefined;
  });
  protected readonly recommendations = computed(() =>
    this.catalog
      .listingCards()
      .filter((product) => product.id !== this.detail()?.id)
      .slice(0, 6),
  );
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

  protected onProfileRequest(): void {
    const id = this.detail()?.sellerId;
    if (id) void this.router.navigate(['/proveedores', id]);
  }

  protected onShippingAddressChangeRequest(): void {
    this.purchaseMessage.set('El cambio de dirección estará disponible próximamente.');
  }
}
