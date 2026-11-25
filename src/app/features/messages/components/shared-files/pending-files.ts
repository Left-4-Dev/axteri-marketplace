import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessagesStore } from '../../stores/messages.store';
import { ResourceItem } from './resource-item';
@Component({
  selector: 'app-pending-files',
  imports: [ResourceItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pending-files.html',
  styleUrl: './pending-files.scss',
})
export class PendingFiles {
  protected readonly store = inject(MessagesStore);
}
