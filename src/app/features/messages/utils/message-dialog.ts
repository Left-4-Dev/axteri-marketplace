import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';

// An image or order can open over the contextual drawer. Only the last owner unlocks the body.
const scrollLocks = new WeakMap<HTMLElement, { count: number; overflow: string }>();

@Directive({
  selector: 'dialog[appMessageDialog]',
  exportAs: 'messageDialog',
  host: {
    '(close)': 'close()',
    '(cancel)': '$event.preventDefault(); close()',
    '(keydown.escape)': '$event.stopPropagation()',
  },
})
export class MessageDialog {
  readonly trigger = input.required<HTMLElement>({ alias: 'appMessageDialog' });
  readonly initialFocus = input('button');
  readonly dismissed = output<void>();
  private readonly dialog = inject<ElementRef<HTMLDialogElement>>(ElementRef).nativeElement;
  private readonly body = this.dialog.ownerDocument.body;
  private active = false;

  constructor() {
    afterNextRender(() => {
      if (typeof this.dialog.showModal === 'function') this.dialog.showModal();
      else this.dialog.setAttribute('open', '');
      const lock = scrollLocks.get(this.body) ?? { count: 0, overflow: this.body.style.overflow };
      lock.count++;
      scrollLocks.set(this.body, lock);
      this.body.style.overflow = 'hidden';
      this.active = true;
      this.dialog.querySelector<HTMLElement>(this.initialFocus())?.focus();
    });
    inject(DestroyRef).onDestroy(() => this.release());
  }

  close(): void {
    if (this.release()) this.dismissed.emit();
  }

  private release(): boolean {
    if (!this.active) return false;
    this.active = false;
    if (this.dialog.open && typeof this.dialog.close === 'function') this.dialog.close();
    else this.dialog.removeAttribute('open');

    const lock = scrollLocks.get(this.body)!;
    if (--lock.count === 0) {
      this.body.style.overflow = lock.overflow;
      scrollLocks.delete(this.body);
    }
    if (this.trigger().isConnected) this.trigger().focus({ preventScroll: true });
    return true;
  }
}
