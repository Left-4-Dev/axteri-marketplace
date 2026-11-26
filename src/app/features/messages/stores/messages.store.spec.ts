import { TestBed } from '@angular/core/testing';
import {
  formatConversationTimestamp,
  formatCurrencyEsPe,
  formatDateSeparator,
  formatMessageTime,
  formatQuantityEsPe,
} from '../utils/messages-format';
import { MessagesStore } from './messages.store';

describe('MessagesStore', () => {
  let store: MessagesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(MessagesStore);
  });

  it('loads the initial commercial conversations without AXTER', () => {
    expect(store.conversations().length).toBeGreaterThanOrEqual(5);
    expect(
      store.conversations().every((conversation) => conversation.counterpart.kind === 'seller'),
    ).toBe(true);
    expect(store.totalUnreadCount()).toBe(4);
  });

  it('filters conversations by seller name, sector, or last message preview', () => {
    store.setSearchTerm('LDF');
    expect(store.filteredConversations().map((item) => item.id)).toEqual(['ldf-projects']);

    store.setSearchTerm('WEG W22');
    expect(store.filteredConversations().map((item) => item.id)).toEqual(['automatizacion-andina']);

    store.setSearchTerm('proveedor-inexistente-xyz');
    expect(store.filteredConversations()).toEqual([]);

    store.setSearchTerm('');
    expect(store.filteredConversations().length).toBe(store.conversations().length);
  });

  it('selects a valid conversationId, loads its messages, and marks it as read', () => {
    const unreadBefore = store
      .conversations()
      .find((item) => item.id === 'electro-sur-industrial')?.unreadCount;
    expect(unreadBefore).toBe(3);

    store.selectConversation('electro-sur-industrial');

    expect(store.activeConversationId()).toBe('electro-sur-industrial');
    expect(store.activeConversation()?.counterpart.seller.name).toBe('Electro Sur Industrial');
    expect(store.isConversationNotFound()).toBe(false);
    expect(store.messages().length).toBe(5);
    expect(
      store.conversations().find((item) => item.id === 'electro-sur-industrial')?.unreadCount,
    ).toBe(0);
  });

  it('flags an unknown conversationId as not found and exposes an empty message list', () => {
    store.selectConversation('proveedor-desconocido');

    expect(store.activeConversationId()).toBe('proveedor-desconocido');
    expect(store.activeConversation()).toBeNull();
    expect(store.isConversationNotFound()).toBe(true);
    expect(store.messages()).toEqual([]);
  });

  it('switches context tabs and toggles between seller info and tabs', () => {
    store.selectConversation('ldf-projects');
    expect(store.activeContextTab()).toBe('products');
    expect(store.contextMode()).toBe('tabs');

    store.selectContextTab('files');
    expect(store.activeContextTab()).toBe('files');
    expect(store.contextMode()).toBe('tabs');

    store.showSellerInfo();
    expect(store.contextMode()).toBe('seller-info');

    store.showContextTabs();
    expect(store.contextMode()).toBe('tabs');
    expect(store.activeContextTab()).toBe('files');

    store.toggleSellerInfo();
    expect(store.contextMode()).toBe('seller-info');

    // Switching conversations returns contextMode to tabs while keeping the selected tab
    store.selectConversation('automatizacion-andina');
    expect(store.contextMode()).toBe('tabs');
    expect(store.activeContextTab()).toBe('files');
  });

  it('sends a local text message and updates the conversation preview immediately', () => {
    store.selectConversation('tableros-control-peru');
    expect(store.messages()).toEqual([]);

    const sent = store.sendTextMessage(
      '  Solicito información sobre tableros autosoportados IP55.  ',
      '2026-11-19T16:30:00-05:00',
    );

    expect(sent).not.toBeNull();
    expect(sent?.body).toBe('Solicito información sobre tableros autosoportados IP55.');
    expect(sent?.author).toBe('buyer');
    expect(store.messages().length).toBe(1);
    expect(store.activeConversation()?.lastActivity).toEqual({
      at: '2026-11-19T16:30:00-05:00',
      preview: 'Solicito información sobre tableros autosoportados IP55.',
      author: 'buyer',
    });
  });

  it('does not send empty or whitespace-only text messages', () => {
    store.selectConversation('ldf-projects');
    const initialCount = store.messages().length;

    expect(store.sendTextMessage('')).toBeNull();
    expect(store.sendTextMessage('   \n\t  ')).toBeNull();
    expect(store.messages().length).toBe(initialCount);
  });

  it('searches the active catalog by brand or name and resets search on navigation', () => {
    store.selectConversation('ldf-projects');
    store.setProductSearch('  jaula de ardilla  ');
    expect(store.filteredProducts().map((p) => p.id)).toEqual(['weg-w22-3kw']);
    store.setProductSearch('schneider');
    expect(store.filteredProducts().length).toBeGreaterThan(1);
    store.setProductSearch('inexistente');
    expect(store.filteredProducts()).toEqual([]);
    store.selectConversation('electro-sur-industrial');
    expect(store.productSearch()).toBe('');
    expect(store.filteredProducts().map((p) => p.id)).not.toContain('weg-w22-3kw');
  });

  it('keeps one line per product, removes zero and isolates drafts and requests by conversation', () => {
    store.selectConversation('ldf-projects');
    const first = store.products()[0];
    const second = store.products()[1];
    store.setProductQuantity(first.id, 1);
    store.setProductQuantity(first.id, 1);
    store.setProductQuantity(first.id, 2);
    store.setProductQuantity(second.id, 1);
    store.setProductQuantity(second.id, 0);
    expect(store.selection()).toEqual([{ ...first, quantity: 2 }]);
    store.selectConversation('electro-sur-industrial');
    expect(store.selection()).toEqual([]);
    store.setProductQuantity('unknown', 1);
    expect(store.sendProductRequest()).toBeNull();
    const other = store.products()[0];
    store.setProductQuantity(other.id, 1);
    store.selectConversation('ldf-projects');
    const draft = store.selection();
    const before = store.messages().length;
    const sent = store.sendProductRequest()!;
    expect(sent.kind).toBe('product-request');
    expect(sent.items).toEqual(draft);
    expect(sent.items[0]).not.toBe(draft[0]);
    expect(store.messages().length).toBe(before + 2);
    expect(store.messages().at(-2)).toEqual(sent);
    expect(store.messages().at(-1)?.kind).toBe('quotation');
    expect(store.activeConversation()?.lastActivity?.preview).toBe('Cotización');
    expect(store.selection()).toEqual([]);
    expect(store.sendProductRequest()).toBeNull();
    store.selectConversation('electro-sur-industrial');
    expect(store.selection()).toEqual([{ ...other, quantity: 1 }]);
    expect(store.messages()).not.toContain(sent);
  });

  it('issues a single order for the accepted quotation and keeps its message in that conversation', () => {
    store.selectConversation('ldf-projects');
    const quote = store.messages().find((message) => message.kind === 'quotation')!;
    store.decideQuotation(quote.id, 'accepted');
    store.decideQuotation(quote.id, 'accepted');
    expect(store.orders().size).toBe(1);
    const [order] = store.orders().values();
    expect(order.quotationId).toBe(quote.id);
    expect(order.lines).toEqual(quote.lines);
    expect(order).toMatchObject({
      subtotalCents: 2020000,
      taxCents: 363600,
      totalCents: 2383600,
      currency: 'PEN',
    });
    const messages = store.messages().filter((message) => message.kind === 'purchase-order');
    expect(messages).toHaveLength(1);
    expect(messages[0].orderId).toBe(order.id);
    store.selectConversation('electro-sur-industrial');
    expect(store.orders().size).toBe(0);
    expect(store.messages()).not.toContain(messages[0]);
    store.selectConversation('ldf-projects');
    expect(store.orders().get(order.id)).toBe(order);
  });

  it('does not issue an order after changes have been requested', () => {
    store.selectConversation('ldf-projects');
    const quote = store.messages().find((message) => message.kind === 'quotation')!;
    store.decideQuotation(quote.id, 'changes-requested');
    store.decideQuotation(quote.id, 'accepted');
    expect(store.orders().size).toBe(0);
    expect(store.messages().some((message) => message.kind === 'purchase-order')).toBe(false);
  });

  it('keeps files and text drafts isolated and releases local URLs only when no longer needed', () => {
    const revoke = vi.fn();
    let sequence = 0;
    vi.stubGlobal(
      'URL',
      class extends URL {
        static override createObjectURL() {
          return 'blob:local-' + ++sequence;
        }
        static override revokeObjectURL = revoke;
      },
    );
    try {
      store.selectConversation('ldf-projects');
      const pdf = new File(['pdf'], 'plan.pdf', { type: 'application/pdf' });
      store.selectFiles([new File(['x'], 'x.html', { type: 'text/html' })]);
      expect(store.attachmentError()).toBeTruthy();
      expect(store.pendingFiles()).toHaveLength(0);
      const oversized = new File(['large'], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(oversized, 'size', { value: store.attachmentPolicy.maxBytes + 1 });
      store.selectFiles([pdf, oversized]);
      expect(store.pendingFiles()).toHaveLength(0);
      store.selectFiles(Array(store.attachmentPolicy.maxFiles + 1).fill(pdf));
      expect(store.pendingFiles()).toHaveLength(0);
      store.selectFiles([new File(['1'], 'anterior.pdf', { type: 'application/pdf' }), pdf]);
      const [removed, retained] = store.pendingFiles();
      store.removeFile(removed.id);
      expect(revoke).toHaveBeenCalledWith(removed.url);
      store.setDraft('Para revisión');
      store.selectConversation('electro-sur-industrial');
      expect(store.pendingFiles()).toEqual([]);
      expect(store.draft()).toBe('');
      store.selectConversation('ldf-projects');
      expect(store.draft()).toBe('Para revisión');
      store.submitDraft(store.draft());
      expect(store.messages().at(-1)).toMatchObject({
        kind: 'attachment',
        note: 'Para revisión',
        resourceIds: [retained.id],
      });
      expect(store.resources().get(retained.id)).toBe(retained);
      expect(store.pendingFiles()).toEqual([]);
      expect(store.draft()).toBe('');
      expect(revoke).not.toHaveBeenCalledWith(retained.url);
      store.selectFiles([pdf]);
      const id = store.pendingFiles()[0].id;
      const product = store.products()[0];
      store.setProductQuantity(product.id, 1);
      const before = store.messages().length;
      store.submitDraft('Con el plano');
      expect(store.messages()).toHaveLength(before + 2);
      expect(store.messages().at(-2)).toMatchObject({
        kind: 'product-request',
        note: 'Con el plano',
        resourceIds: [id],
      });
      expect(store.messages().at(-1)?.kind).toBe('quotation');
      expect(store.selection()).toEqual([]);
      expect(store.pendingFiles()).toEqual([]);
      store.selectConversation('electro-sur-industrial');
      expect(store.resources().has(id)).toBe(false);
      store.selectFiles([pdf]);
      store.submitDraft('');
      expect(store.messages().at(-1)).toMatchObject({ kind: 'attachment' });
      expect(store.messages().at(-1)).not.toHaveProperty('note');
      store.selectFiles([pdf]);
      TestBed.resetTestingModule();
      expect(revoke).toHaveBeenCalledTimes(5);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('formats timestamps, date separators, currency, and quantities in es-PE', () => {
    const referenceNow = new Date('2026-11-19T18:00:00-05:00');

    expect(formatMessageTime('2026-11-19T14:22:00-05:00')).toBe('14:22');
    expect(formatConversationTimestamp('2026-11-19T14:22:00-05:00', referenceNow)).toBe('14:22');
    expect(formatConversationTimestamp('2026-11-18T16:45:00-05:00', referenceNow)).toBe('Ayer');
    expect(formatDateSeparator('2026-11-19T14:22:00-05:00', referenceNow)).toBe('Hoy');
    expect(formatDateSeparator('2026-11-18T10:00:00-05:00', referenceNow)).toBe('Ayer');
    expect(formatCurrencyEsPe(1500.5, 'PEN')).toContain('1,500.50');
    expect(formatQuantityEsPe(1250)).toBe('1,250');
  });

  it('resolves and reuses conversations by counterpart.seller.id for all five canonical sellers and rejects unknown sellers', () => {
    const sellerIds = [
      'ldf-projects',
      'electro-sur-industrial',
      'automatizacion-andina',
      'suministros-mineros-pacifico',
      'tableros-control-peru',
    ];

    for (const sellerId of sellerIds) {
      const first = store.findOrCreateConversationBySellerId(sellerId);
      const second = store.findOrCreateConversationBySellerId(sellerId);
      expect(first).not.toBeNull();
      expect(first?.counterpart.seller.id).toBe(sellerId);
      expect(second).toBe(first);
    }

    const countBefore = store.conversations().length;
    expect(store.findOrCreateConversationBySellerId('proveedor-inexistente')).toBeNull();
    expect(store.findOrCreateConversationBySellerId('   ')).toBeNull();
    expect(store.conversations().length).toBe(countBefore);
  });

  it('validates product ownership, SKU variants, quantity, and intention when applying product context while preserving drafts and selections', () => {
    store.selectConversation('ldf-projects');
    store.setDraft('Borrador existente');
    const firstProduct = store.products()[0];
    store.setProductQuantity(firstProduct.id, 1);

    // Contact intention does not add products
    expect(
      store.applyProductContext({
        productId: 'weg-w22-3kw',
        quantity: 2,
        intention: 'contactar',
      }),
    ).toBe(false);
    expect(store.selection().map((p) => p.id)).toEqual([firstProduct.id]);

    // Product belonging to another seller is rejected
    expect(
      store.applyProductContext({
        productId: 'schneider-c60h-dc-1',
        quantity: 2,
        intention: 'cotizar',
      }),
    ).toBe(false);

    // Invalid SKU or invalid quantity is rejected
    expect(
      store.applyProductContext({
        productId: 'weg-w22-3kw',
        sku: 'SKU-INEXISTENTE',
        quantity: 2,
        intention: 'cotizar',
      }),
    ).toBe(false);
    expect(
      store.applyProductContext({
        productId: 'weg-w22-3kw',
        quantity: 0,
        intention: 'cotizar',
      }),
    ).toBe(false);

    // Valid variant SKU of weg-w22-3kw resolves to w22-11kw-4p and preserves existing draft and selection
    expect(
      store.applyProductContext({
        productId: 'weg-w22-3kw',
        sku: 'W22-11KW-4P-380-B3-IP55',
        quantity: 3,
        intention: 'cotizar',
      }),
    ).toBe(true);
    expect(store.draft()).toBe('Borrador existente');
    expect(store.selection()).toEqual([
      expect.objectContaining({ id: firstProduct.id, quantity: 1 }),
      expect.objectContaining({ id: 'w22-11kw-4p', quantity: 3 }),
    ]);

    // Re-applying the same product context is idempotent (does not duplicate or sum to 6)
    expect(
      store.applyProductContext({
        productId: 'weg-w22-3kw',
        sku: 'W22-11KW-4P-380-B3-IP55',
        quantity: 3,
        intention: 'cotizar',
      }),
    ).toBe(true);
    expect(store.selection()).toHaveLength(2);
    expect(store.selection()[1]?.quantity).toBe(3);
  });

  it('generates synchronous quotations and purchase orders for any canonical seller without generating quotes for normal messages', () => {
    store.selectConversation('electro-sur-industrial');
    const initialCount = store.messages().length;

    // Normal text message and contact request do NOT generate quotations
    store.sendTextMessage('Consulta general de disponibilidad');
    store.requestContact();
    expect(store.messages().length).toBe(initialCount + 2);
    expect(store.messages().some((m) => m.kind === 'quotation')).toBe(false);

    // Product request generates a synchronous quotation with real catalog prices
    const esiProduct = store.products()[0];
    store.setProductQuantity(esiProduct.id, 4);
    store.sendProductRequest('Cotizar envío a Tacna');

    const latestMessages = store.messages();
    expect(latestMessages.at(-2)?.kind).toBe('product-request');
    const quote = latestMessages.at(-1)!;
    expect(quote.kind).toBe('quotation');
    if (quote.kind === 'quotation') {
      expect(quote.status).toBe('pending');
      expect(quote.lines).toEqual([
        {
          product: esiProduct.name,
          quantity: 4,
          unitPriceCents: 5000,
        },
      ]);
      expect(store.resources().has(quote.resourceId)).toBe(true);

      // Accepting the quotation generates a single purchase order
      store.decideQuotation(quote.id, 'accepted');
      store.decideQuotation(quote.id, 'accepted');
      expect(store.orders().size).toBe(1);
      const [order] = store.orders().values();
      expect(order.supplier).toBe('Electro Sur Industrial');
      expect(order.subtotalCents).toBe(20000);
      expect(order.taxCents).toBe(3600);
      expect(order.totalCents).toBe(23600);
    }
  });
});
