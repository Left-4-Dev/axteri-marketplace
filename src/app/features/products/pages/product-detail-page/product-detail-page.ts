import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductGallery } from '../../components/product-gallery/product-gallery';
import { ProductSummary } from '../../components/product-summary/product-summary';
import { ProductPurchasePanel } from '../../components/product-purchase-panel/product-purchase-panel';
import { PRODUCT_DETAILS } from '../../data/product-detail.data';
import { ProductPurchaseIntent } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-detail-page',
  imports: [RouterLink, ProductGallery, ProductSummary, ProductPurchasePanel],
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

  protected onPurchaseIntent(intent: ProductPurchaseIntent): void {
    const action =
      intent.kind === 'contact' ? 'El contacto con el proveedor' : 'La solicitud de cotización';
    this.purchaseMessage.set(
      `${action} para ${intent.quantity} unidad(es) estará disponible próximamente. No se ha enviado ninguna solicitud.`,
    );
  }
}
