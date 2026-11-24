import { Injectable } from '@angular/core';
import { mockSellerProducts } from '../data/message-products.data';
import { Observable, of } from 'rxjs';
import {
  SELLER_CONTACTS,
  INITIAL_CONVERSATIONS_FIXTURE,
  INITIAL_MESSAGES_BY_CONVERSATION_FIXTURE,
} from '../data/messages.fixtures';
import {
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
