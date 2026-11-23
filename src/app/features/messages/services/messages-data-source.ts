import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation, Message } from '../models/messages.model';
import { MockMessagesDataSource } from './mock-messages-data-source';

@Injectable({
  providedIn: 'root',
  useClass: MockMessagesDataSource,
})
export abstract class MessagesDataSource {
  abstract getConversations(): Observable<readonly Conversation[]>;
  abstract getConversationById(conversationId: string): Observable<Conversation | null>;
  abstract getMessages(conversationId: string): Observable<readonly Message[]>;
}
