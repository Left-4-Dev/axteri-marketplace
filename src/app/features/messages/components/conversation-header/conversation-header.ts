import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { ConversationSeller } from '../../models/messages.model';
import { getSellerInitial } from '../../utils/message-preview';

@Component({
  selector: 'app-conversation-header',
  templateUrl: './conversation-header.html',
  styleUrl: './conversation-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationHeader {
  readonly seller = input.required<ConversationSeller>();
  readonly isSellerInfoActive = input(false);
  readonly isContextDrawerOpen = input(false);

  readonly backToList = output<void>();
  readonly sellerInfoToggle = output<HTMLButtonElement>();
  readonly openContextTabs = output<HTMLButtonElement>();

  protected readonly logoFailed = linkedSignal({
    source: this.seller,
    computation: () => false,
  });

  protected getInitial(name: string): string {
    return getSellerInitial(name);
  }

  protected onLogoError(): void {
    this.logoFailed.set(true);
  }
}
