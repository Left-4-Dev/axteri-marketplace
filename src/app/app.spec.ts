import { TestBed } from '@angular/core/testing';
import { By, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';
import { Header } from './core/layout/header/header';

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([false, true])(
    'connects Header Search to the Hero (reduced motion: %s)',
    async (reducedMotion) => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      );
      await TestBed.configureTestingModule({
        imports: [App],
        providers: appConfig.providers,
      }).compileComponents();
      const fixture = TestBed.createComponent(App);
      await TestBed.inject(Router).navigateByUrl('/');
      await fixture.whenStable();
      const query = (fixture.nativeElement as HTMLElement).querySelector<HTMLTextAreaElement>(
        '[data-primary-search]',
      )!;
      query.scrollIntoView = vi.fn();
      const header = fixture.debugElement.query(By.directive(Header)).componentInstance as Header;
      header.primarySearchRequested.emit();
      expect(document.activeElement).toBe(query);
      expect(query.scrollIntoView).toHaveBeenCalledWith({
        block: 'nearest',
        behavior: reducedMotion ? 'instant' : 'smooth',
      });
      expect(query.value).toBe('');
    },
  );

  it('renders the public layout and home sections in the reference order', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: appConfig.providers,
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('main h1')?.textContent).toBe('Axteri Marketplace');
    expect(TestBed.inject(Title).getTitle()).toBe('Axteri Marketplace');
    expect(element.querySelectorAll('header')).toHaveLength(1);
    expect(element.querySelectorAll('main')).toHaveLength(1);
    expect(element.querySelectorAll('footer')).toHaveLength(1);
    expect(element.querySelectorAll('h1')).toHaveLength(1);
    expect(Array.from(element.querySelectorAll('main section'), (section) => section.id)).toEqual([
      'hero',
      'limited-offers',
      'categories',
      'featured-products',
      'quality-banner',
      'preferred-brands',
      'news',
      'recommendations',
    ]);
    expect(element.querySelectorAll('app-product-card')).toHaveLength(20);
    expect(element.querySelectorAll('#categories article')).toHaveLength(9);
    expect(element.querySelectorAll('#preferred-brands article')).toHaveLength(3);
    expect(element.querySelector('img[src*="references/"]')).toBeNull();
  });
});
