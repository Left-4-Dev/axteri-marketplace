export type MessageAuthor = 'buyer' | 'seller';

export type ConversationContextTab = 'products' | 'files' | 'orders';

export type ConversationContextMode = 'tabs' | 'seller-info';

export type MobileMessagesPanel = 'list' | 'chat';

export interface ConversationSeller {
  readonly id: string;
  readonly name: string;
  readonly verified: boolean;
  readonly tagline: string;
  readonly logoUrl?: string;
  readonly sector: string;
  readonly supplierType: string;
  readonly locationLabel: string;
  readonly yearsInIndustry: number;
  readonly businessHours: readonly string[];
  readonly profilePath?: string;
}

export interface SellerCounterpart {
  readonly kind: 'seller';
  readonly seller: ConversationSeller;
}

/**
 * Discriminated union for the conversation counterpart.
 * Etapa 1 supports commercial sellers; prepared to extend with `{ kind: 'assistant' }` (AXTER) later.
 */
export type ConversationCounterpart = SellerCounterpart;

export interface ConversationLastActivity {
  readonly at: string;
  readonly preview: string;
  readonly author: MessageAuthor | 'system';
}

export interface Conversation {
  readonly id: string;
  readonly counterpart: ConversationCounterpart;
  readonly unreadCount: number;
  readonly lastActivity: ConversationLastActivity | null;
}

export interface MessageBase {
  readonly id: string;
  readonly conversationId: string;
  readonly sentAt: string;
}

export interface TextMessage extends MessageBase {
  readonly kind: 'text';
  readonly author: MessageAuthor;
  readonly body: string;
}

export interface ConversationStartedEvent {
  readonly type: 'conversation-started';
  readonly label: string;
}

export type SystemMessageEvent = ConversationStartedEvent;

export interface SystemMessage extends MessageBase {
  readonly kind: 'system';
  readonly event: SystemMessageEvent;
}

export interface ConversationProduct {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly imageUrl?: string;
  readonly priceLabel?: string;
}

export interface RequestedProduct extends ConversationProduct {
  readonly quantity: number;
}

export interface ProductRequestMessage extends MessageBase {
  readonly note?: string;
  readonly kind: 'product-request';
  readonly author: 'buyer';
  readonly items: readonly RequestedProduct[];
}

export type Message = TextMessage | SystemMessage | ProductRequestMessage;

export interface MessageDayGroup {
  readonly dateKey: string;
  readonly label: string;
  readonly messages: readonly Message[];
}
