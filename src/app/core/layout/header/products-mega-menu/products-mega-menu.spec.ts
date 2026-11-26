import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { PRODUCT_MENU_CATEGORIES, RECOMMENDED_PRODUCT_BRANDS } from '../data/products-menu.data';
import { ProductsMegaMenu } from './products-mega-menu';

describe('ProductsMegaMenu', () => {
  let fixture: ComponentFixture<ProductsMegaMenu>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsMegaMenu],
      providers: [provideRouter([{ path: 'productos', children: [] }])],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductsMegaMenu);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders nine categories, seven unique subcategory links with categoria and subcategoria query params, and seven brand links with marca query param', () => {
    expect(element.querySelectorAll('[role="tab"]')).toHaveLength(9);
    const subcategoryLinks = element.querySelectorAll<HTMLAnchorElement>(
      '.products-menu__subcategory',
    );
    const labels = [...subcategoryLinks].map((node) => node.textContent?.trim());
    expect(labels).toHaveLength(7);
    expect(new Set(labels).size).toBe(7);
    const expectedSubcategories = PRODUCT_MENU_CATEGORIES[0].subcategories;
    subcategoryLinks.forEach((link, index) => {
      expect(link.getAttribute('href')).toBe(
        `/productos?categoria=${PRODUCT_MENU_CATEGORIES[0].id}&subcategoria=${expectedSubcategories[index].id}`,
      );
    });
    const brandLinks = element.querySelectorAll<HTMLAnchorElement>('a.products-menu__brand');
    expect(brandLinks).toHaveLength(7);
    brandLinks.forEach((link, index) => {
      expect(link.getAttribute('href')).toBe(
        `/productos?marca=${RECOMMENDED_PRODUCT_BRANDS[index].id}`,
      );
    });
    expect(element.querySelectorAll('.products-menu__brand-logo')).toHaveLength(7);
    expect(element.querySelectorAll('[role="tab"][tabindex="0"]')).toHaveLength(1);
  });

  it('navigates to /productos?categoria={id} when clicking a category tab', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const tabs = element.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[7].click();
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(['/productos'], {
      queryParams: { categoria: PRODUCT_MENU_CATEGORIES[7].id },
    });
  });

  it('changes the selected category and content on pointer or focus without inventing items', async () => {
    const tabs = element.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[1].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(element.querySelector('[role="tabpanel"]')?.getAttribute('aria-labelledby')).toBe(
      tabs[1].id,
    );
    expect(element.querySelector('.products-menu__empty')).not.toBeNull();
    tabs[0].focus();
    await fixture.whenStable();
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(element.querySelectorAll('.products-menu__subcategory')).toHaveLength(7);
  });

  it('supports vertical arrow navigation, Home, End and entry to the content panel', async () => {
    const tabs = element.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    fixture.componentInstance.focusActiveCategory();
    for (const [key, expected] of [
      ['ArrowUp', 8],
      ['ArrowDown', 0],
      ['End', 8],
      ['Home', 0],
    ] as const) {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await fixture.whenStable();
      expect(document.activeElement).toBe(tabs[expected]);
      expect(tabs[expected].getAttribute('aria-selected')).toBe('true');
    }
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(element.querySelector('[role="tabpanel"]'));
  });
});
