import { Injectable } from '@angular/core';
import { mockSellerProducts } from '../data/message-products.data';
import { Observable, of } from 'rxjs';
import {
  SELLER_CONTACTS,
  INITIAL_CONVERSATIONS_FIXTURE,
  INITIAL_MESSAGES_BY_CONVERSATION_FIXTURE,
} from '../data/messages.fixtures';
import {
  PurchaseOrder,
  QuotationMessage,
  ContactInfoMessage,
  Conversation,
  ConversationProduct,
  Message,
  ProductRequestMessage,
  RequestedProduct,
} from '../models/messages.model';

@Injectable({ providedIn: 'root' })
export class MockMessagesDataSource {
  private requestCounter = 0;

  private orderNumber = 0;
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
    return {
      id: `${conversation.id}-contact-${++this.requestCounter}`,
      conversationId: conversation.id,
      kind: 'contact-info',
      author: 'seller',
      sentAt: new Date().toISOString(),
      contact: { ...SELLER_CONTACTS[conversation.counterpart.seller.id] },
    };
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

  getConversations(): Observable<readonly Conversation[]> {
    return of(INITIAL_CONVERSATIONS_FIXTURE);
  }

  getConversationById(conversationId: string): Observable<Conversation | null> {
    const found = INITIAL_CONVERSATIONS_FIXTURE.find((item) => item.id === conversationId) ?? null;
    return of(found);
  }

  getMessages(conversationId: string): Observable<readonly Message[]> {
    return of(INITIAL_MESSAGES_BY_CONVERSATION_FIXTURE[conversationId] ?? []);
  }
}
