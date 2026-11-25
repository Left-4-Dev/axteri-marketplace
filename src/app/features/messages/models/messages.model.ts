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

export type SharedResource = {
  readonly id: string;
  readonly conversationId: string;
  readonly name: string;
  readonly format: string;
  readonly bytes?: number;
} & (
  | { readonly kind: 'document'; readonly url?: string }
  | { readonly kind: 'image'; readonly url: string }
);

export interface AttachmentMessage extends MessageBase {
  readonly kind: 'attachment';
  readonly author: MessageAuthor;
  readonly resourceIds: readonly string[];
  readonly note?: string;
}

export interface ProductRequestMessage extends MessageBase {
  readonly resourceIds?: readonly string[];
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

export interface OrderLine {
  readonly product: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
}

export interface PurchaseOrder {
  readonly id: string;
  readonly quotationId: string;
  readonly conversationId: string;
  readonly issuedAt: string;
  readonly supplier: string;
  readonly customer: { readonly name: string; readonly taxId: string; readonly address: string };
  readonly lines: readonly OrderLine[];
  readonly currency: string;
  readonly subtotalCents: number;
  readonly taxCents: number;
  readonly taxPercent: number;
  readonly totalCents: number;
  readonly terms: string;
  readonly scope: string;
  readonly bank: { readonly name: string; readonly account: string };
}

export interface PurchaseOrderMessage extends MessageBase {
  readonly kind: 'purchase-order';
  readonly author: 'seller';
  readonly orderId: string;
}

export interface QuotationMessage extends MessageBase {
  readonly kind: 'quotation';
  readonly lines: readonly OrderLine[];
  readonly currency: string;
  readonly author: 'seller';
  readonly resourceId: string;
  readonly summary: string;
  readonly status: 'pending' | QuotationDecision;
}

export type Message =
  | TextMessage
  | SystemMessage
  | ProductRequestMessage
  | ContactInfoMessage
  | QuotationMessage
  | PurchaseOrderMessage
  | AttachmentMessage;

export interface MessageDayGroup {
  readonly dateKey: string;
  readonly label: string;
  readonly messages: readonly Message[];
}
