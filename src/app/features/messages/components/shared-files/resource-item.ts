import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SharedResource } from '../../models/messages.model';

import { MessageDialog } from '../../utils/message-dialog';

@Component({
  selector: 'app-message-resource',
  imports: [DecimalPipe, MessageDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resource-item.html',
  styleUrl: './resource-item.scss',
})
export class ResourceItem {
  readonly resource = input.required<SharedResource>();
  protected readonly previewOpen = signal(false);
}
