import { computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import {
  Conversation,
  ConversationContextMode,
  ConversationContextTab,
  Message,
  TextMessage,
} from '../models/messages.model';
import { MessagesDataSource } from '../services/messages-data-source';
import { getMessagePreview } from '../utils/message-preview';

@Injectable({ providedIn: 'root' })
export class MessagesStore {
  private readonly dataSource = inject(MessagesDataSource);

  private readonly conversationsState = signal<readonly Conversation[]>([]);
  private readonly messagesByConversationState = signal<
    Readonly<Record<string, readonly Message[]>>
  >({});
  private readonly activeConversationIdState = signal<string | null>(null);
  private readonly searchTermState = signal('');
  private readonly activeContextTabState = signal<ConversationContextTab>('products');
  private readonly contextModeState = signal<ConversationContextMode>('tabs');

  private localMessageCounter = 0;

  readonly conversations = this.conversationsState.asReadonly();
  readonly activeConversationId = this.activeConversationIdState.asReadonly();
  readonly searchTerm = this.searchTermState.asReadonly();
  readonly activeContextTab = this.activeContextTabState.asReadonly();
  readonly contextMode = this.contextModeState.asReadonly();

  readonly filteredConversations = computed(() => {
    const query = this.searchTermState().trim().toLowerCase();
    const all = this.conversationsState();
    if (!query) {
      return all;
    }

    return all.filter((conversation) => {
      const { seller } = conversation.counterpart;
      const preview = conversation.lastActivity?.preview ?? '';
      return (
        seller.name.toLowerCase().includes(query) ||
        seller.sector.toLowerCase().includes(query) ||
        seller.tagline.toLowerCase().includes(query) ||
        preview.toLowerCase().includes(query)
      );
    });
  });

  readonly activeConversation = computed(() => {
    const id = this.activeConversationIdState();
    if (!id) {
      return null;
    }
    return this.conversationsState().find((conversation) => conversation.id === id) ?? null;
  });

  readonly isConversationNotFound = computed(() => {
    const id = this.activeConversationIdState();
    return Boolean(id) && this.activeConversation() === null;
  });

  readonly messages = computed<readonly Message[]>(() => {
    const active = this.activeConversation();
    if (!active) {
      return [];
    }
    return this.messagesByConversationState()[active.id] ?? [];
  });

  readonly totalUnreadCount = computed(() =>
    this.conversationsState().reduce((sum, item) => sum + item.unreadCount, 0),
  );

  constructor() {
    this.loadConversations();
  }

  selectConversation(conversationId: string | null): void {
    const normalizedId = conversationId?.trim() || null;
    const previousId = this.activeConversationIdState();

    this.activeConversationIdState.set(normalizedId);
    if (previousId !== normalizedId) {
      this.contextModeState.set('tabs');
    }

    if (!normalizedId) {
      return;
    }

    const exists = this.conversationsState().some((item) => item.id === normalizedId);
    if (!exists) {
      return;
    }

    this.ensureMessagesLoaded(normalizedId);
    this.markConversationAsRead(normalizedId);
  }

  setSearchTerm(term: string): void {
    this.searchTermState.set(term);
  }

  selectContextTab(tab: ConversationContextTab): void {
    this.activeContextTabState.set(tab);
    this.contextModeState.set('tabs');
  }

  showSellerInfo(): void {
    this.contextModeState.set('seller-info');
  }

  showContextTabs(): void {
    this.contextModeState.set('tabs');
  }

  toggleSellerInfo(): void {
    this.contextModeState.update((current) => (current === 'seller-info' ? 'tabs' : 'seller-info'));
  }

  sendTextMessage(rawBody: string, sentAt: string = new Date().toISOString()): TextMessage | null {
    const body = rawBody.trim();
    const active = this.activeConversation();
    if (!body || !active) {
      return null;
    }

    this.localMessageCounter += 1;
    const newMessage: TextMessage = {
      id: `${active.id}-local-${this.localMessageCounter}`,
      conversationId: active.id,
      kind: 'text',
      author: 'buyer',
      body,
      sentAt,
    };

    const currentMessages = this.messagesByConversationState()[active.id] ?? [];
    this.messagesByConversationState.update((state) => ({
      ...state,
      [active.id]: [...currentMessages, newMessage],
    }));

    const preview = getMessagePreview(newMessage);
    this.conversationsState.update((items) =>
      items.map((item) =>
        item.id === active.id
          ? {
              ...item,
              unreadCount: 0,
              lastActivity: {
                at: sentAt,
                preview,
                author: 'buyer',
              },
            }
          : item,
      ),
    );

    return newMessage;
  }

  private loadConversations(): void {
    this.dataSource
      .getConversations()
      .pipe(take(1))
      .subscribe((conversations) => {
        this.conversationsState.set(conversations);
        const currentId = this.activeConversationIdState();
        if (currentId && conversations.some((item) => item.id === currentId)) {
          this.ensureMessagesLoaded(currentId);
          this.markConversationAsRead(currentId);
        }
      });
  }

  private ensureMessagesLoaded(conversationId: string): void {
    const loaded = this.messagesByConversationState();
    if (Object.prototype.hasOwnProperty.call(loaded, conversationId)) {
      return;
    }

    this.dataSource
      .getMessages(conversationId)
      .pipe(take(1))
      .subscribe((messages) => {
        this.messagesByConversationState.update((state) => ({
          ...state,
          [conversationId]: messages,
        }));
      });
  }

  private markConversationAsRead(conversationId: string): void {
    this.conversationsState.update((items) =>
      items.map((item) =>
        item.id === conversationId && item.unreadCount > 0 ? { ...item, unreadCount: 0 } : item,
      ),
    );
  }
}
