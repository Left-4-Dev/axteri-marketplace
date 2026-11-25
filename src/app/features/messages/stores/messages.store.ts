import { ATTACHMENT_POLICY } from '../data/attachment-policy';
import { DestroyRef, computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import {
  AttachmentMessage,
  SharedResource,
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

  readonly attachmentPolicy = inject(ATTACHMENT_POLICY);
  private readonly localFiles = signal<readonly { resource: SharedResource; pending: boolean }[]>(
    [],
  );
  private readonly drafts = signal<Readonly<Record<string, string>>>({});
  readonly draft = computed(() => this.drafts()[this.activeConversationId() ?? ''] ?? '');
  readonly attachmentError = signal('');
  readonly pendingFiles = computed(() =>
    this.localFiles()
      .filter(
        (file) => file.pending && file.resource.conversationId === this.activeConversationId(),
      )
      .map((file) => file.resource),
  );
  readonly resources = computed(() => {
    const id = this.activeConversationId();
    const shared = id ? this.dataSource.getResources(id) : [];
    const sent = this.localFiles()
      .filter((file) => !file.pending && file.resource.conversationId === id)
      .map((file) => file.resource);
    return new Map([...shared, ...sent].map((resource) => [resource.id, resource]));
  });

  setDraft(text: string): void {
    const active = this.activeConversation();
    if (active) this.drafts.update((drafts) => ({ ...drafts, [active.id]: text }));
  }

  selectFiles(files: readonly File[]): void {
    const active = this.activeConversation();
    if (!active || !files.length) return;
    const { maxFiles, maxBytes, formats } = this.attachmentPolicy;
    if (files.length + this.pendingFiles().length > maxFiles) {
      this.attachmentError.set('Puedes adjuntar hasta ' + maxFiles + ' archivos por envío.');
      return;
    }
    for (const file of files) {
      if (!Object.hasOwn(formats, file.type) || !file.size || file.size > maxBytes) {
        this.attachmentError.set(
          file.name +
            ': elige un archivo ' +
            Object.values(formats).join(', ') +
            ' de hasta ' +
            maxBytes / 1048576 +
            ' MiB, con contenido.',
        );
        return;
      }
    }
    const additions = files.map((file) => {
      const resource: SharedResource = {
        id: 'local-file-' + ++this.localMessageCounter,
        conversationId: active.id,
        name: file.name,
        kind: file.type.startsWith('image/') ? 'image' : 'document',
        format: formats[file.type],
        bytes: file.size,
        url: URL.createObjectURL(file),
      };
      return { resource, pending: true };
    });
    this.localFiles.update((current) => [...current, ...additions]);
    this.attachmentError.set('');
  }

  removeFile(id: string): void {
    const file = this.pendingFiles().find((item) => item.id === id);
    if (!file) return;
    if (file.url) URL.revokeObjectURL(file.url);
    this.localFiles.update((files) => files.filter((entry) => entry.resource.id !== id));
    this.attachmentError.set('');
  }

  submitDraft(body: string): void {
    const active = this.activeConversation();
    if (!active) return;
    const ids = this.pendingFiles().map((file) => file.id);
    if (this.selection().length) {
      this.sendProductRequest(body, ids);
    } else if (ids.length) {
      this.appendMessage({
        id: active.id + '-local-' + ++this.localMessageCounter,
        kind: 'attachment',
        author: 'buyer',
        sentAt: new Date().toISOString(),
        conversationId: active.id,
        resourceIds: ids,
        ...(body.trim() ? { note: body.trim() } : {}),
      });
    } else {
      this.sendTextMessage(body);
    }
    if (ids.length)
      this.localFiles.update((files) =>
        files.map((file) => (ids.includes(file.resource.id) ? { ...file, pending: false } : file)),
      );
    this.setDraft('');
    this.attachmentError.set('');
  }

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
    inject(DestroyRef).onDestroy(() => {
      for (const { resource } of this.localFiles())
        if (resource.url) URL.revokeObjectURL(resource.url);
    });
    this.loadConversations();
  }

  selectConversation(conversationId: string | null): void {
    const normalizedId = conversationId?.trim() || null;
    const previousId = this.activeConversationIdState();

    this.activeConversationIdState.set(normalizedId);
    if (previousId !== normalizedId) {
      this.attachmentError.set('');
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

  sendProductRequest(
    note?: string,
    resourceIds: readonly string[] = [],
  ): ProductRequestMessage | null {
    const active = this.activeConversation();
    const items = this.selection();
    if (!active || !items.length) return null;
    const message = {
      ...this.dataSource.createProductRequest(active.id, items, note?.trim()),
      ...(resourceIds.length ? { resourceIds } : {}),
    };
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
    newMessage:
      | AttachmentMessage
      | TextMessage
      | ProductRequestMessage
      | ContactInfoMessage
      | PurchaseOrderMessage,
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
