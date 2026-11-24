import { Injectable } from '@angular/core';
import { mockSellerProducts } from '../data/message-products.data';
import { Observable, of } from 'rxjs';
import {
  INITIAL_CONVERSATIONS_FIXTURE,
  INITIAL_MESSAGES_BY_CONVERSATION_FIXTURE,
} from '../data/messages.fixtures';
import {
  Conversation,
  ConversationProduct,
  Message,
  ProductRequestMessage,
  RequestedProduct,
} from '../models/messages.model';

@Injectable({ providedIn: 'root' })
export class MockMessagesDataSource {
  private requestCounter = 0;

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
