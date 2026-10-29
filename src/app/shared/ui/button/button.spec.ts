import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button, ButtonType, ButtonVariant } from './button';

@Component({
  imports: [Button],
  template: `
    <app-button
      [variant]="variant()"
      [type]="type()"
      [disabled]="disabled()"
      [ariaDescribedby]="ariaDescribedby()"
      (click)="onClick()"
    >
      {{ label() }}
    </app-button>
  `,
})
class ButtonHost {
  readonly label = signal('CARGAR MÁS');
  readonly variant = signal<ButtonVariant>('primary');
  readonly type = signal<ButtonType>('button');
  readonly disabled = signal(false);
  readonly ariaDescribedby = signal<string | undefined>(undefined);
  readonly clicks = signal(0);

  onClick(): void {
    this.clicks.update((count) => count + 1);
  }
}

describe('Button', () => {
  let fixture: ComponentFixture<ButtonHost>;
  let host: ButtonHost;
  let element: HTMLElement;

  const nativeButton = () => element.querySelector<HTMLButtonElement>('button.button')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonHost],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHost);
    host = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('projects content as the accessible button label', () => {
    expect(nativeButton().textContent?.trim()).toBe('CARGAR MÁS');
  });

  it('uses the primary variant and type="button" by default', () => {
    const button = nativeButton();
    expect(button.type).toBe('button');
    expect(button.classList.contains('button--primary')).toBe(true);
    expect(button.classList.contains('button--light')).toBe(false);
    expect(button.disabled).toBe(false);
  });

  it('applies the light variant when requested', () => {
    host.variant.set('light');
    host.label.set('VER MÁS PRODUCTOS');
    fixture.detectChanges();

    const button = nativeButton();
    expect(button.classList.contains('button--light')).toBe(true);
    expect(button.classList.contains('button--primary')).toBe(false);
    expect(button.textContent?.trim()).toBe('VER MÁS PRODUCTOS');
  });

  it('applies the semantic disabled attribute and forwards aria-describedby when provided', () => {
    host.disabled.set(true);
    host.ariaDescribedby.set('brand-catalog-hint');
    fixture.detectChanges();

    const button = nativeButton();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-describedby')).toBe('brand-catalog-hint');
  });

  it('emits click events when enabled', () => {
    nativeButton().click();
    fixture.detectChanges();

    expect(host.clicks()).toBe(1);
  });

  it('prevents click execution when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    nativeButton().click();
    fixture.detectChanges();

    expect(host.clicks()).toBe(0);
  });
});
