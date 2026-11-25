import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MessagesStore } from '../../stores/messages.store';
import { ResourceItem } from './resource-item';

@Component({
  selector: 'app-shared-files',
  imports: [ResourceItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shared-files.html',
  styleUrl: './shared-files.scss',
})
export class SharedFiles {
  private readonly store = inject(MessagesStore);
  protected readonly groups = computed(() => {
    const files = Array.from(this.store.resources().values());
    return [
      {
        title: 'Documentos',
        files: files.filter((f) => f.kind === 'document'),
        empty: 'Aún no hay documentos compartidos.',
      },
      {
        title: 'Imágenes',
        files: files.filter((f) => f.kind === 'image'),
        empty: 'Aún no hay imágenes compartidas.',
      },
    ];
  });
}
