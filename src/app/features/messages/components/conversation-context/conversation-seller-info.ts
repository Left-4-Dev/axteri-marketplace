import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConversationSeller } from '../../models/messages.model';
import { getSellerInitial } from '../../utils/message-preview';

@Component({
  selector: 'app-conversation-seller-info',
  imports: [RouterLink],
  templateUrl: './conversation-seller-info.html',
  styleUrl: './conversation-seller-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationSellerInfo {
  readonly seller = input.required<ConversationSeller>();
  readonly backToTabs = output<void>();

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
