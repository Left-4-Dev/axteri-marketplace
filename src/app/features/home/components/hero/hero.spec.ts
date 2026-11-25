import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Hero } from './hero';

describe('Hero', () => {
  let fixture: ComponentFixture<Hero>;
  let element: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero],
      providers: [provideRouter([{ path: 'productos', children: [] }])],
    }).compileComponents();
    fixture = TestBed.createComponent(Hero);
    router = TestBed.inject(Router);
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

  it('prevents native search submission and navigates to /productos?q= on submit button or Enter', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const query = element.querySelector<HTMLTextAreaElement>('[data-primary-search]')!;
    query.value = '  Equipos industriales  ';
    const event = new Event('submit', { bubbles: true, cancelable: true });
    element.querySelector('form')!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(query.value).toBe('  Equipos industriales  ');
    expect(navigateSpy).toHaveBeenCalledWith(['/productos'], {
      queryParams: { q: 'Equipos industriales' },
    });

    navigateSpy.mockClear();
    query.value = 'Motor trifásico';
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    query.dispatchEvent(enterEvent);
    expect(enterEvent.defaultPrevented).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/productos'], {
      queryParams: { q: 'Motor trifásico' },
    });

    navigateSpy.mockClear();
    const shiftEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    query.dispatchEvent(shiftEnter);
    expect(shiftEnter.defaultPrevented).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
