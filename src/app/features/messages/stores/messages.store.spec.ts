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
});
