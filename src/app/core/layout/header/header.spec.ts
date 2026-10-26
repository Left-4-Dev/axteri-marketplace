import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let element: HTMLElement;

  beforeEach(async () => {
    vi.stubGlobal('scrollY', 0);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Header);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function scrollTo(y: number): Promise<void> {
    vi.stubGlobal('scrollY', y);
    window.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
  }

  it('keeps a single navbar and reveals its input only above 48px', async () => {
    const navbar = element.querySelector('.header__navbar');
    const input = element.querySelector<HTMLInputElement>('.header__search-input')!;
    expect(input.hidden).toBe(true);
    await scrollTo(48);
    expect(input.hidden).toBe(true);
    await scrollTo(49);
    expect(input.hidden).toBe(false);
    expect(element.querySelector('.header__navbar')).toBe(navbar);

    input.focus();
    await scrollTo(0);
    expect(input.hidden).toBe(true);
    expect(document.activeElement).toBe(element.querySelector('.header__search-button'));
  });

  it('requests the primary search after the scoped bounce ends', async () => {
    const requested = vi.fn();
    fixture.componentInstance.primarySearchRequested.subscribe(requested);
    const button = element.querySelector<HTMLButtonElement>('.header__search-button')!;
    button.click();
    await fixture.whenStable();
    expect(requested).not.toHaveBeenCalled();
    expect(button.classList.contains('header__search-button--attention')).toBe(true);

    button.dispatchEvent(
      Object.assign(new Event('animationend'), {
        animationName: '_ngcontent-test_header-search-bounce',
      }),
    );
    await fixture.whenStable();
    expect(requested).toHaveBeenCalledTimes(1);
    expect(button.classList.contains('header__search-button--attention')).toBe(false);
  });

  it('requests focus immediately with reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const requested = vi.fn();
    fixture.componentInstance.primarySearchRequested.subscribe(requested);
    const button = element.querySelector<HTMLButtonElement>('.header__search-button')!;
    button.click();
    await fixture.whenStable();
    expect(requested).toHaveBeenCalledTimes(1);
    expect(button.classList.contains('header__search-button--attention')).toBe(false);
  });

  it('focuses its own input when scrolled without triggering the Hero', async () => {
    const requested = vi.fn();
    fixture.componentInstance.primarySearchRequested.subscribe(requested);
    await scrollTo(200);
    element.querySelector<HTMLButtonElement>('.header__search-button')!.click();
    expect(document.activeElement).toBe(element.querySelector('.header__search-input'));
    expect(requested).not.toHaveBeenCalled();
  });

  it('removes its scroll listener when destroyed', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    fixture.destroy();
    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
