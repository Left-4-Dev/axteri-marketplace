import { Component, computed, ElementRef, signal, viewChild, viewChildren } from '@angular/core';
import { PRODUCT_MENU_CATEGORIES, RECOMMENDED_PRODUCT_BRANDS } from '../data/products-menu.data';

@Component({
  selector: 'app-products-mega-menu',
  templateUrl: './products-mega-menu.html',
  styleUrl: './products-mega-menu.scss',
})
export class ProductsMegaMenu {
  protected readonly categories = PRODUCT_MENU_CATEGORIES;
  protected readonly brands = RECOMMENDED_PRODUCT_BRANDS;
  protected readonly activeCategoryId = signal(this.categories[0].id);
  protected readonly activeCategory = computed(() =>
    this.categories.find((category) => category.id === this.activeCategoryId())!,
  );
  protected readonly subcategoryColumns = computed(() => {
    const items = this.activeCategory().subcategories;
    const split = Math.ceil(items.length / 2);
    return [items.slice(0, split), items.slice(split)];
  });
  private readonly categoryButtons = viewChildren<ElementRef<HTMLButtonElement>>('categoryButton');
  private readonly contentPanel = viewChild.required<ElementRef<HTMLElement>>('contentPanel');

  focusActiveCategory(): void {
    const index = this.categories.findIndex((category) => category.id === this.activeCategoryId());
    this.categoryButtons()[index].nativeElement.focus({ preventScroll: true });
  }

  protected selectCategory(id: string): void {
    this.activeCategoryId.set(id);
  }

  protected onCategoryKeydown(event: KeyboardEvent, index: number): void {
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = (index + 1) % this.categories.length;
        break;
      case 'ArrowUp':
        next = (index - 1 + this.categories.length) % this.categories.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = this.categories.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.contentPanel().nativeElement.focus({ preventScroll: true });
        return;
      default:
        return;
    }
    event.preventDefault();
    this.selectCategory(this.categories[next].id);
    this.categoryButtons()[next].nativeElement.focus();
  }
}
