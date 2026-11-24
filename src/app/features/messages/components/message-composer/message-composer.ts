import {
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
  readonly sellerName = input('');

  readonly messageSubmitted = output<string>();

  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  protected readonly draft = signal('');
  protected readonly isExpanded = signal(false);
  protected readonly canSubmit = computed(
    () => !this.disabled() && (this.hasProducts() || this.draft().trim().length > 0),
  );

  private collapseBelowLength: number | null = null;

  constructor() {
    afterRenderEffect({
      write: () => {
        this.draft();
        this.isExpanded();
        this.resizeTextarea();
      },
    });
  }

  protected onDraftInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement | null)?.value ?? '';
    this.draft.set(value);
    this.syncExpandedState(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
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
    this.draft.set('');
    this.isExpanded.set(false);
    this.collapseBelowLength = null;
  }

  private syncExpandedState(value: string): void {
    if (!value) {
      this.isExpanded.set(false);
      this.collapseBelowLength = null;
      return;
    }

    if (value.includes('\n')) {
      this.isExpanded.set(true);
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

    if (!this.isExpanded() && isMultiLine) {
      this.collapseBelowLength = value.length;
      this.isExpanded.set(true);
    } else if (
      this.isExpanded() &&
      !isMultiLine &&
      (this.collapseBelowLength === null || value.length < this.collapseBelowLength)
    ) {
      this.isExpanded.set(false);
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
