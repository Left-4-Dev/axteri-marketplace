import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConversationContext } from '../../components/conversation-context/conversation-context';
import { ConversationHeader } from '../../components/conversation-header/conversation-header';
import { ConversationList } from '../../components/conversation-list/conversation-list';
import { MessageComposer } from '../../components/message-composer/message-composer';
import { MessageList } from '../../components/message-list/message-list';
import { ConversationContextTab, MobileMessagesPanel } from '../../models/messages.model';
import { MessagesStore } from '../../stores/messages.store';

@Component({
  selector: 'app-messages-page',
  imports: [
    RouterLink,
    ConversationList,
    ConversationHeader,
    MessageList,
    MessageComposer,
    ConversationContext,
  ],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class MessagesPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(MessagesStore);

  protected readonly mobilePanel = signal<MobileMessagesPanel>('chat');
  protected readonly contextDrawerOpen = signal(false);

  protected readonly activeSeller = computed(
    () => this.store.activeConversation()?.counterpart.seller ?? null,
  );

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.store.selectConversation(params.get('conversationId'));
      this.mobilePanel.set('chat');
      this.contextDrawerOpen.set(false);
    });
  }

  protected onSearchTermChange(term: string): void {
    this.store.setSearchTerm(term);
  }

  protected onConversationSelected(): void {
    this.mobilePanel.set('chat');
    this.contextDrawerOpen.set(false);
  }

  protected showMobileConversationList(): void {
    this.mobilePanel.set('list');
    this.contextDrawerOpen.set(false);
  }

  protected onSellerInfoToggle(): void {
    if (this.store.contextMode() === 'seller-info') {
      this.store.showContextTabs();
    } else {
      this.store.showSellerInfo();
      this.contextDrawerOpen.set(true);
    }
  }

  protected onOpenContextTabs(): void {
    this.store.showContextTabs();
    this.contextDrawerOpen.set(true);
  }

  protected onContextTabChange(tab: ConversationContextTab): void {
    this.store.selectContextTab(tab);
  }

  protected onBackToContextTabs(): void {
    this.store.showContextTabs();
  }

  protected closeContextDrawer(): void {
    this.contextDrawerOpen.set(false);
  }

  protected onMessageSubmitted(body: string): void {
    this.store.sendTextMessage(body);
  }

  protected onEscapeKey(): void {
    if (this.contextDrawerOpen()) {
      this.contextDrawerOpen.set(false);
    }
  }
}
