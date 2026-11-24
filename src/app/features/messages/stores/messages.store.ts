import { computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import {
  PurchaseOrder,
  PurchaseOrderMessage,
  ContactInfoMessage,
  QuotationDecision,
  Conversation,
  ConversationContextMode,
  ConversationContextTab,
  Message,
  RequestedProduct,
  ProductRequestMessage,
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

  private readonly selections = signal<Readonly<Record<string, readonly RequestedProduct[]>>>({});
  private readonly productQuery = signal('');
  readonly productSearch = this.productQuery.asReadonly();
  readonly products = computed(() => {
    const seller = this.activeConversation()?.counterpart.seller;
    return seller ? this.dataSource.getProducts(seller.id) : [];
  });
  readonly filteredProducts = computed(() => {
    const query = this.productQuery().trim().toLocaleLowerCase();
    return this.products().filter((product) =>
      (product.brand + ' ' + product.name).toLocaleLowerCase().includes(query),
    );
  });
  readonly selection = computed(() => {
    const active = this.activeConversation();
    return active ? (this.selections()[active.id] ?? []) : [];
  });
  readonly quantities = computed(
    () => new Map(this.selection().map((item) => [item.id, item.quantity])),
  );

  private readonly orderState = signal<readonly PurchaseOrder[]>([]);
  readonly orders = computed(
    () =>
      new Map(
        this.orderState()
          .filter((order) => order.conversationId === this.activeConversationId())
          .map((order) => [order.id, order]),
      ),
  );

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
      this.productQuery.set('');
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

  setProductSearch(term: string): void {
    this.productQuery.set(term);
  }

  setProductQuantity(productId: string, quantity: number): void {
    const active = this.activeConversation();
    const product = this.products().find((item) => item.id === productId);
    if (!active || !product || !Number.isSafeInteger(quantity) || quantity < 0) return;
    const items = this.selection();
    let next: readonly RequestedProduct[];
    if (quantity === 0) {
      next = items.filter((item) => item.id !== productId);
    } else if (this.quantities().has(productId)) {
      next = items.map((item) => (item.id === productId ? { ...item, quantity } : item));
    } else {
      next = [...items, { ...product, quantity }];
    }
    this.selections.update((state) => ({ ...state, [active.id]: next }));
  }

  requestContact(): void {
    const active = this.activeConversation();
    if (active) this.appendMessage(this.dataSource.requestContact(active));
  }

  decideQuotation(id: string, decision: QuotationDecision): void {
    const active = this.activeConversation();
    const messages = this.messages();
    const quote = messages.find((message) => message.id === id);
    if (!active || quote?.kind !== 'quotation' || quote.status !== 'pending') return;
    const order =
      decision === 'accepted'
        ? this.dataSource.createPurchaseOrder(quote, active.counterpart.seller.name)
        : null;
    this.messagesByConversationState.update((state) => ({
      ...state,
      [active.id]: messages.map((message) =>
        message === quote ? { ...quote, status: decision } : message,
      ),
    }));
    if (order) {
      this.orderState.update((orders) => [...orders, order]);
      this.appendMessage({
        id: order.id,
        orderId: order.id,
        kind: 'purchase-order',
        author: 'seller',
        conversationId: active.id,
        sentAt: order.issuedAt,
      });
    }
  }

  sendProductRequest(note?: string): ProductRequestMessage | null {
    const active = this.activeConversation();
    const items = this.selection();
    if (!active || !items.length) return null;
    const message = this.dataSource.createProductRequest(active.id, items, note?.trim());
    this.appendMessage(message);
    this.selections.update((state) => ({ ...state, [active.id]: [] }));
    return message;
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

    this.appendMessage(newMessage);
    return newMessage;
  }

  private appendMessage(
    newMessage: TextMessage | ProductRequestMessage | ContactInfoMessage | PurchaseOrderMessage,
  ): void {
    const { conversationId, sentAt } = newMessage;
    const currentMessages = this.messagesByConversationState()[conversationId] ?? [];
    this.messagesByConversationState.update((state) => ({
      ...state,
      [conversationId]: [...currentMessages, newMessage],
    }));

    const preview = getMessagePreview(newMessage);
    this.conversationsState.update((items) =>
      items.map((item) =>
        item.id === conversationId
          ? {
              ...item,
              unreadCount: 0,
              lastActivity: {
                at: sentAt,
                preview,
                author: newMessage.author,
              },
            }
          : item,
      ),
    );
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
