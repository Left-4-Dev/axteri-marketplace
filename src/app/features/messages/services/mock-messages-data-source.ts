import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catalog } from '../../../core/catalog/catalog.repository';
import { mockSellerProducts } from '../data/message-products.data';
import {
  buildConversationSeller,
  INITIAL_CONVERSATIONS_FIXTURE,
  INITIAL_MESSAGES_BY_CONVERSATION_FIXTURE,
  SELLER_CONTACTS,
} from '../data/messages.fixtures';
import {
  ContactInfoMessage,
  Conversation,
  ConversationProduct,
  Message,
  OrderLine,
  ProductRequestMessage,
  PurchaseOrder,
  QuotationMessage,
  RequestedProduct,
  SharedResource,
} from '../models/messages.model';

const DEFAULT_QUOTE_UNIT_PRICE_CENTS = 150000;

@Injectable({ providedIn: 'root' })
export class MockMessagesDataSource {
  private requestCounter = 0;
  private quoteNumber = 24;
  private orderNumber = 0;
  private conversations: readonly Conversation[] = [...INITIAL_CONVERSATIONS_FIXTURE];
  private readonly messagesByConversation = new Map<string, readonly Message[]>(
    Object.entries(INITIAL_MESSAGES_BY_CONVERSATION_FIXTURE),
  );
  private readonly resourcesByConversation = new Map<string, readonly SharedResource[]>([
    [
      'ldf-projects',
      [
        {
          id: 'ldf-024-pdf',
          conversationId: 'ldf-projects',
          kind: 'document',
          name: 'Cotización LDF-024.pdf',
          format: 'PDF',
        },
        {
          id: 'ldf-w22-photo',
          conversationId: 'ldf-projects',
          kind: 'image',
          name: 'Motor WEG W22.webp',
          format: 'WEBP',
          bytes: 94996,
          url: '/assets/products/weg-w22/gallery/weg-w22-01.webp',
        },
      ],
    ],
  ]);

  createPurchaseOrder(quote: QuotationMessage, supplier: string): PurchaseOrder {
    const lines = quote.lines.map((line) => ({ ...line }));
    const subtotalCents = lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0);
    const taxPercent = 18;
    const taxCents = Math.round((subtotalCents * taxPercent) / 100);
    return {
      id: 'OC-' + String(++this.orderNumber).padStart(5, '0'),
      quotationId: quote.id,
      conversationId: quote.conversationId,
      issuedAt: new Date().toISOString(),
      currency: quote.currency,
      supplier,
      lines,
      subtotalCents,
      taxPercent,
      taxCents,
      totalCents: subtotalCents + taxCents,
      customer: {
        name: 'Junta de Propietarios Lovento',
        taxId: '20000000000',
        address: 'Av. República 1234, San Isidro, Lima',
      },
      terms: 'Entrega coordinada en Lima en 12 días calendario. Garantía de fábrica de un año.',
      scope:
        'Suministro de los equipos indicados. Instalación y puesta en marcha por cuenta del cliente.',
      bank: { name: 'Banco de demostración', account: 'Cuenta de ejemplo · 000-0000000' },
    };
  }

  requestContact(conversation: Conversation): ContactInfoMessage {
    const sellerId = conversation.counterpart.seller.id;
    const contact = SELLER_CONTACTS[sellerId] ?? {
      name: conversation.counterpart.seller.name,
      phone: '+51 1 000 0000',
      email: `${sellerId}@example.com`,
    };
    return {
      id: `${conversation.id}-contact-${++this.requestCounter}`,
      conversationId: conversation.id,
      kind: 'contact-info',
      author: 'seller',
      sentAt: new Date().toISOString(),
      contact: { ...contact },
    };
  }

  getResources(conversationId: string): readonly SharedResource[] {
    return this.resourcesByConversation.get(conversationId) ?? [];
  }

  getProducts(sellerId: string): readonly ConversationProduct[] {
    return mockSellerProducts(sellerId);
  }

  createProductRequest(
    conversationId: string,
    items: readonly RequestedProduct[],
    note?: string,
  ): ProductRequestMessage {
    return {
      id: `${conversationId}-request-${++this.requestCounter}`,
      conversationId,
      sentAt: new Date().toISOString(),
      kind: 'product-request',
      ...(note ? { note } : {}),
      author: 'buyer',
      items: items.map((item) => ({ ...item })),
    };
  }

  createQuotationForRequest(
    conversationId: string,
    items: readonly RequestedProduct[],
    sentAt: string = new Date().toISOString(),
  ): QuotationMessage {
    const code = String(++this.quoteNumber).padStart(3, '0');
    let currency = 'PEN';
    let currencyResolved = false;

    const lines: readonly OrderLine[] = items.map((item) => {
      const catalogProduct = catalog.getProduct(item.id);
      let unitPriceCents = DEFAULT_QUOTE_UNIT_PRICE_CENTS;
      if (catalogProduct) {
        if (catalogProduct.price.kind === 'fixed') {
          unitPriceCents = Math.round(catalogProduct.price.amount * 100);
          if (!currencyResolved) {
            currency = catalogProduct.price.currency;
            currencyResolved = true;
          }
        } else if (catalogProduct.price.kind === 'range') {
          unitPriceCents = Math.round(catalogProduct.price.min * 100);
          if (!currencyResolved) {
            currency = catalogProduct.price.currency;
            currencyResolved = true;
          }
        }
      }
      return {
        product: item.name,
        quantity: item.quantity,
        unitPriceCents,
      };
    });

    const resourceId = `${conversationId}-quote-${code}-pdf`;
    const resource: SharedResource = {
      id: resourceId,
      conversationId,
      kind: 'document',
      name: `Cotización ${code}.pdf`,
      format: 'PDF',
    };
    const existingResources = this.resourcesByConversation.get(conversationId) ?? [];
    this.resourcesByConversation.set(conversationId, [...existingResources, resource]);

    return {
      id: `${conversationId}-quote-${code}`,
      conversationId,
      kind: 'quotation',
      author: 'seller',
      sentAt,
      currency,
      lines,
      resourceId,
      summary: items.map((item) => item.name).join(', '),
      status: 'pending',
    };
  }

  findOrCreateConversationBySellerId(sellerId: string): Conversation | null {
    const normalizedSellerId = sellerId?.trim() ?? '';
    if (!normalizedSellerId) {
      return null;
    }

    const existing = this.conversations.find(
      (item) => item.counterpart.seller.id === normalizedSellerId,
    );
    if (existing) {
      return existing;
    }

    const seller = buildConversationSeller(normalizedSellerId);
    if (!seller) {
      return null;
    }

    const candidateId = `conv-${seller.id}`;
    const id = this.conversations.some((item) => item.id === candidateId)
      ? `${candidateId}-${++this.requestCounter}`
      : candidateId;
    const created: Conversation = {
      id,
      counterpart: {
        kind: 'seller',
        seller,
      },
      unreadCount: 0,
      lastActivity: null,
    };
    this.conversations = [...this.conversations, created];
    this.messagesByConversation.set(created.id, []);
    return created;
  }

  getConversations(): Observable<readonly Conversation[]> {
    return of(this.conversations);
  }

  getConversationById(conversationId: string): Observable<Conversation | null> {
    const found = this.conversations.find((item) => item.id === conversationId) ?? null;
    return of(found);
  }

  getMessages(conversationId: string): Observable<readonly Message[]> {
    return of(this.messagesByConversation.get(conversationId) ?? []);
  }
}
