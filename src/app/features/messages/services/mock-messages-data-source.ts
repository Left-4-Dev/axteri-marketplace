import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  INITIAL_CONVERSATIONS_FIXTURE,
  INITIAL_MESSAGES_BY_CONVERSATION_FIXTURE,
} from '../data/messages.fixtures';
import { Conversation, Message } from '../models/messages.model';

@Injectable({ providedIn: 'root' })
export class MockMessagesDataSource {
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
