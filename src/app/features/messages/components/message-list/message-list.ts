import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { MessageProductSummary } from '../product-selection/product-summary';
import { Message, MessageDayGroup } from '../../models/messages.model';
import { formatDateSeparator, formatMessageTime, getDateKey } from '../../utils/messages-format';

@Component({
  selector: 'app-message-list',
  imports: [MessageProductSummary],
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onViewportResize()',
  },
})
export class MessageList {
  readonly messages = input.required<readonly Message[]>();
  readonly sellerName = input('');

  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly dayGroups = computed<readonly MessageDayGroup[]>(() => {
    const groups: { dateKey: string; label: string; messages: Message[] }[] = [];

    for (const message of this.messages()) {
      const dateKey = getDateKey(message.sentAt);
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.dateKey !== dateKey) {
        groups.push({
          dateKey,
          label: formatDateSeparator(message.sentAt),
          messages: [message],
        });
      } else {
        lastGroup.messages.push(message);
      }
    }

    return groups;
  });

  constructor() {
    afterRenderEffect({
      write: () => {
        if (this.messages().length > 0) {
          this.scrollToLatest();
        }
      },
    });
  }

  protected onViewportResize(): void {
    if (this.messages().length > 0) {
      this.scrollToLatest();
    }
  }

  protected formatTime(isoDate: string): string {
    return formatMessageTime(isoDate);
  }

  private scrollToLatest(): void {
    const container = this.scrollContainer()?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
