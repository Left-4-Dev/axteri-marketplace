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

export interface ContactDetails {
  readonly name: string;
  readonly phone: string;
  readonly email: string;
}

export interface ContactInfoMessage extends MessageBase {
  readonly kind: 'contact-info';
  readonly author: 'seller';
  readonly contact: ContactDetails;
}

export type QuotationDecision = 'accepted' | 'changes-requested';

export interface QuotationMessage extends MessageBase {
  readonly kind: 'quotation';
  readonly author: 'seller';
  readonly fileName: string;
  readonly summary: string;
  readonly status: 'pending' | QuotationDecision;
}

export type Message =
  TextMessage | SystemMessage | ProductRequestMessage | ContactInfoMessage | QuotationMessage;

export interface MessageDayGroup {
  readonly dateKey: string;
  readonly label: string;
  readonly messages: readonly Message[];
}
