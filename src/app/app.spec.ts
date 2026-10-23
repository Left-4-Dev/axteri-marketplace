import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';

describe('App', () => {
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
