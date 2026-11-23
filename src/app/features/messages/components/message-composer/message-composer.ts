import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-message-composer',
  templateUrl: './message-composer.html',
  styleUrl: './message-composer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComposer {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly sellerName = input('');

  readonly messageSubmitted = output<string>();

  protected readonly draft = signal('');
  protected readonly canSubmit = computed(() => !this.disabled() && this.draft().trim().length > 0);

  protected onDraftInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement | null)?.value ?? '';
    this.draft.set(value);
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

  protected submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    const text = this.draft().trim();
    this.messageSubmitted.emit(text);
    this.draft.set('');
  }
}
