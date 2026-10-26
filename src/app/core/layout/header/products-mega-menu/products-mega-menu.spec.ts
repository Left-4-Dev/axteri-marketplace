import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsMegaMenu } from './products-mega-menu';

describe('ProductsMegaMenu', () => {
  let fixture: ComponentFixture<ProductsMegaMenu>;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ProductsMegaMenu);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders nine categories, seven unique subcategories and seven brand assets', () => {
    expect(element.querySelectorAll('[role="tab"]')).toHaveLength(9);
    const labels = [...element.querySelectorAll('.products-menu__subcategory')].map((node) =>
      node.textContent?.trim(),
    );
    expect(labels).toHaveLength(7);
    expect(new Set(labels).size).toBe(7);
    expect(element.querySelectorAll('.products-menu__brand-logo')).toHaveLength(7);
    expect(element.querySelectorAll('[role="tab"][tabindex="0"]')).toHaveLength(1);
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
