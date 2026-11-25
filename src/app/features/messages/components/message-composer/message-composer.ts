import { MessagesStore } from '../../stores/messages.store';
import { PendingFiles } from '../shared-files/pending-files';
import {
  inject,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-message-composer',
  imports: [PendingFiles],
  templateUrl: './message-composer.html',
  styleUrl: './message-composer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class MessageComposer {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hasProducts = input(false);

  readonly messageSubmitted = output<string>();

  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  protected readonly store = inject(MessagesStore);
  protected readonly draft = this.store.draft;
  protected readonly accept = Object.keys(this.store.attachmentPolicy.formats).join(',');
  private pickerConversation: string | null = null;
  private displayedConversation: string | null = null;

  protected openPicker(picker: HTMLInputElement): void {
    this.pickerConversation = this.store.activeConversationId();
    picker.click();
  }
  protected readPicker(picker: HTMLInputElement): void {
    if (this.pickerConversation === this.store.activeConversationId()) {
      this.store.selectFiles(Array.from(picker.files ?? []));
    }
    picker.value = '';
  }
  private readonly textExpanded = signal(false);
  protected readonly isExpanded = computed(
    () => this.store.pendingFiles().length > 0 || this.textExpanded(),
  );
  protected readonly canSubmit = computed(
    () =>
      !this.disabled() &&
      (this.hasProducts() ||
        this.store.pendingFiles().length > 0 ||
        this.draft().trim().length > 0),
  );

  private collapseBelowLength: number | null = null;

  constructor() {
    afterRenderEffect({
      write: () => {
        const id = this.store.activeConversationId();
        const draft = this.draft();
        if (id !== this.displayedConversation) {
          this.displayedConversation = id;
          this.collapseBelowLength = null;
          this.textExpanded.set(false);
        }
        this.hasProducts();
        this.store.pendingFiles();
        this.syncExpandedState(draft);
        this.isExpanded();
        this.resizeTextarea();
      },
    });
  }

  protected onDraftInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement | null)?.value ?? '';
    this.store.setDraft(value);
    this.syncExpandedState(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.submit();
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  protected onResize(): void {
    this.collapseBelowLength = null;
    this.syncExpandedState(this.draft());
    this.resizeTextarea();
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    const text = this.draft().trim();
    this.messageSubmitted.emit(text);
    this.textExpanded.set(false);
    this.collapseBelowLength = null;
  }

  private syncExpandedState(value: string): void {
    if (!value) {
      this.textExpanded.set(false);
      this.collapseBelowLength = null;
      return;
    }

    if (value.includes('\n')) {
      this.textExpanded.set(true);
      this.collapseBelowLength = null;
      return;
    }

    const el = this.textareaRef()?.nativeElement;
    if (!el) {
      return;
    }

    el.style.blockSize = 'auto';
    const minHeight = Number.parseFloat(getComputedStyle(el).minBlockSize) || 40;
    const isMultiLine = el.scrollHeight > minHeight + 2;

    if (!this.textExpanded() && isMultiLine) {
      this.collapseBelowLength = value.length;
      this.textExpanded.set(true);
    } else if (
      this.textExpanded() &&
      !isMultiLine &&
      (this.collapseBelowLength === null || value.length < this.collapseBelowLength)
    ) {
      this.textExpanded.set(false);
      this.collapseBelowLength = null;
    }
  }

  private resizeTextarea(): void {
    const el = this.textareaRef()?.nativeElement;
    if (!el) {
      return;
    }

    el.style.blockSize = 'auto';
    const maxHeight = Number.parseFloat(getComputedStyle(el).maxBlockSize) || 104;
    const scrollHeight = el.scrollHeight;
    const nextHeight = Math.min(scrollHeight, maxHeight);

    el.style.blockSize = `${nextHeight}px`;
    el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }
}
