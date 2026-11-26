import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SharedResource,
  PurchaseOrder,
  QuotationMessage,
  ContactInfoMessage,
  Conversation,
  ConversationProduct,
  Message,
  ProductRequestMessage,
  RequestedProduct,
} from '../models/messages.model';
import { MockMessagesDataSource } from './mock-messages-data-source';

@Injectable({
  providedIn: 'root',
  useClass: MockMessagesDataSource,
})
export abstract class MessagesDataSource {
  abstract createPurchaseOrder(quote: QuotationMessage, supplier: string): PurchaseOrder;
  abstract requestContact(conversation: Conversation): ContactInfoMessage;
  abstract getResources(conversationId: string): readonly SharedResource[];
  abstract getProducts(sellerId: string): readonly ConversationProduct[];
  abstract createProductRequest(
    conversationId: string,
    items: readonly RequestedProduct[],
    note?: string,
  ): ProductRequestMessage;
  abstract createQuotationForRequest(
    conversationId: string,
    items: readonly RequestedProduct[],
    sentAt?: string,
  ): QuotationMessage;
  abstract findOrCreateConversationBySellerId(sellerId: string): Conversation | null;
  abstract getConversations(): Observable<readonly Conversation[]>;
  abstract getConversationById(conversationId: string): Observable<Conversation | null>;
  abstract getMessages(conversationId: string): Observable<readonly Message[]>;
}
