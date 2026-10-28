import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hero } from './hero';

describe('Hero', () => {
  let fixture: ComponentFixture<Hero>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Hero] }).compileComponents();
    fixture = TestBed.createComponent(Hero);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('toggles AI mode without changing the query', async () => {
    const toggle = element.querySelector<HTMLButtonElement>('[role="switch"]')!;
    const query = element.querySelector<HTMLTextAreaElement>('[data-primary-search]')!;
    expect(query.value).toBe('');
    query.value = 'Comparar atomizadores';
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(query.value).toBe('Comparar atomizadores');
  });

  it('prevents native search submission while preserving the entered query', () => {
    const query = element.querySelector<HTMLTextAreaElement>('[data-primary-search]')!;
    query.value = 'Equipos industriales';
    const event = new Event('submit', { bubbles: true, cancelable: true });
    element.querySelector('form')!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(query.value).toBe('Equipos industriales');
  });
});
