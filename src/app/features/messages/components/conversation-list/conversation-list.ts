import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Conversation } from '../../models/messages.model';
import { getSellerInitial } from '../../utils/message-preview';
import { formatConversationTimestamp } from '../../utils/messages-format';

@Component({
  selector: 'app-conversation-list',
  imports: [RouterLink],
  templateUrl: './conversation-list.html',
  styleUrl: './conversation-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationList {
  readonly conversations = input.required<readonly Conversation[]>();
  readonly activeConversationId = input<string | null>(null);
  readonly searchTerm = input('');
  readonly totalUnreadCount = input(0);

  readonly searchTermChange = output<string>();
  readonly conversationSelected = output<string>();

  private readonly failedLogos = signal<Readonly<Record<string, boolean>>>({});

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.searchTermChange.emit(value);
  }

  protected clearSearch(): void {
    this.searchTermChange.emit('');
  }

  protected onSelectConversation(conversationId: string): void {
    this.conversationSelected.emit(conversationId);
  }

  protected hasLogo(conversation: Conversation): boolean {
    const { seller } = conversation.counterpart;
    return Boolean(seller.logoUrl) && !this.failedLogos()[seller.id];
  }

  protected markLogoFailed(sellerId: string): void {
    this.failedLogos.update((state) => ({ ...state, [sellerId]: true }));
  }

  protected getInitial(name: string): string {
    return getSellerInitial(name);
  }

  protected formatTimestamp(isoDate: string): string {
    return formatConversationTimestamp(isoDate);
  }
}
