import {
  afterNextRender,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  Injector,
  viewChild,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MessageDialog } from '../../utils/message-dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';
import { ConversationContext } from '../../components/conversation-context/conversation-context';
import { ConversationHeader } from '../../components/conversation-header/conversation-header';
import { SelectionTray } from '../../components/product-selection/selection-tray';
import { ConversationList } from '../../components/conversation-list/conversation-list';
import { MessageComposer } from '../../components/message-composer/message-composer';
import { MessageList } from '../../components/message-list/message-list';
import { ConversationContextTab, MobileMessagesPanel } from '../../models/messages.model';
import { MessagesStore } from '../../stores/messages.store';

@Component({
  selector: 'app-messages-page',
  imports: [
    RouterLink,
    MessageDialog,
    NgTemplateOutlet,
    ConversationList,
    ConversationHeader,
    MessageList,
    MessageComposer,
    SelectionTray,
    ConversationContext,
  ],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(MessagesStore);

  protected readonly mobilePanel = signal<MobileMessagesPanel>('chat');
  protected readonly drawerTrigger = signal<HTMLButtonElement | null>(null);
  private readonly drawerMedia =
    inject(DOCUMENT).defaultView?.matchMedia?.('(max-width: 79.9375rem)');

  protected readonly activeSeller = computed(
    () => this.store.activeConversation()?.counterpart.seller ?? null,
  );

  constructor() {
    const closeOnDesktop = () => {
      if (!this.drawerMedia?.matches) this.closeContextDrawer();
    };
    this.drawerMedia?.addEventListener('change', closeOnDesktop);
    inject(DestroyRef).onDestroy(() =>
      this.drawerMedia?.removeEventListener('change', closeOnDesktop),
    );
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, queryParams]) => {
        const id = params.get('conversationId');
        const previousId = this.store.activeConversationId();
        this.store.selectConversation(id);
        this.mobilePanel.set(id ? 'chat' : 'list');
        if (previousId !== (id?.trim() || null)) {
          this.drawerTrigger.set(null);
        }
        if (id && this.hasCommercialQueryParams(queryParams)) {
          this.consumeCommercialQueryParams(id, queryParams);
        }
      });
  }

  private hasCommercialQueryParams(queryParams: ParamMap): boolean {
    const keys = [
      'producto',
      'productId',
      'variante',
      'sku',
      'cantidad',
      'quantity',
      'intencion',
      'intent',
    ];
    return keys.some((key) => queryParams.has(key));
  }

  private consumeCommercialQueryParams(conversationId: string, queryParams: ParamMap): void {
    this.store.applyProductContext({
      productId: queryParams.get('producto') ?? queryParams.get('productId'),
      sku: queryParams.get('variante') ?? queryParams.get('sku'),
      quantity: queryParams.get('cantidad') ?? queryParams.get('quantity'),
      intention: queryParams.get('intencion') ?? queryParams.get('intent'),
    });
    void this.router.navigate(['/mensajes', conversationId], {
      replaceUrl: true,
    });
  }

  protected onSearchTermChange(term: string): void {
    this.store.setSearchTerm(term);
  }

  protected onConversationSelected(): void {
    this.mobilePanel.set('chat');
    this.drawerTrigger.set(null);
  }

  protected showMobileConversationList(): void {
    this.mobilePanel.set('list');
    this.drawerTrigger.set(null);
  }

  protected onSellerInfoToggle(trigger: HTMLButtonElement): void {
    if (!this.drawerMedia?.matches && this.store.contextMode() === 'seller-info') {
      this.store.showContextTabs();
    } else {
      this.store.showSellerInfo();
      if (this.drawerMedia?.matches) this.drawerTrigger.set(trigger);
    }
  }

  private readonly injector = inject(Injector);
  private readonly contextPanel = viewChild<ElementRef<HTMLElement>>('contextPanel');

  protected openProducts(trigger: HTMLButtonElement): void {
    this.store.selectContextTab('products');
    if (this.drawerMedia?.matches) this.drawerTrigger.set(trigger);
    else this.focusSelectedTab();
  }

  private focusSelectedTab(): void {
    afterNextRender(
      () =>
        this.contextPanel()
          ?.nativeElement.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
          ?.focus(),
      { injector: this.injector },
    );
  }

  protected onOpenContextTabs(trigger: HTMLButtonElement): void {
    this.store.showContextTabs();
    if (this.drawerMedia?.matches) this.drawerTrigger.set(trigger);
  }

  protected onContextTabChange(tab: ConversationContextTab): void {
    this.store.selectContextTab(tab);
  }

  protected onBackToContextTabs(): void {
    this.store.showContextTabs();
    this.focusSelectedTab();
  }

  protected closeContextDrawer(): void {
    this.drawerTrigger.set(null);
  }
}
