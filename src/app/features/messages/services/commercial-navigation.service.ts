import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogRepository } from '../../../core/catalog/catalog.repository';
import { MessagesStore } from '../stores/messages.store';

export interface CommercialProductQuoteRequest {
  readonly sellerId?: string;
  readonly productId: string;
  readonly sku?: string;
  readonly quantity?: number;
}

@Injectable({ providedIn: 'root' })
export class CommercialNavigationService {
  private readonly router = inject(Router);
  private readonly store = inject(MessagesStore);
  private readonly catalog = inject(CatalogRepository);

  contactSeller(sellerId: string | undefined): boolean {
    const normalizedSellerId = sellerId?.trim() ?? '';
    if (!normalizedSellerId) {
      return false;
    }

    const conversation = this.store.findOrCreateConversationBySellerId(normalizedSellerId);
    if (!conversation) {
      return false;
    }

    void this.router.navigate(['/mensajes', conversation.id]);
    return true;
  }

  requestProductQuote(request: CommercialProductQuoteRequest): boolean {
    const productId = request.productId?.trim() ?? '';
    if (!productId) {
      return false;
    }

    const product = this.catalog.getProduct(productId);
    const resolvedSellerId = (request.sellerId ?? product?.sellerId)?.trim() ?? '';
    if (!resolvedSellerId) {
      return false;
    }

    const conversation = this.store.findOrCreateConversationBySellerId(resolvedSellerId);
    if (!conversation) {
      return false;
    }

    const quantity =
      request.quantity !== undefined &&
      Number.isSafeInteger(request.quantity) &&
      request.quantity >= 1
        ? request.quantity
        : 1;
    const sku = request.sku?.trim() || product?.sku;

    void this.router.navigate(['/mensajes', conversation.id], {
      queryParams: {
        producto: productId,
        cantidad: quantity,
        ...(sku ? { variante: sku } : {}),
        intencion: 'cotizar',
      },
    });
    return true;
  }
}
