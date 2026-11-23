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

/**
 * Discriminated union of messages supported in Etapa 1.
 * Later stages will extend this union with product-request, quotation, contact-info, purchase-order, and attachment.
 */
export type Message = TextMessage | SystemMessage;

export interface MessageDayGroup {
  readonly dateKey: string;
  readonly label: string;
  readonly messages: readonly Message[];
}
