import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  Injector,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HEADER_NAVIGATION_LINKS, PRODUCT_MENU_CATEGORIES } from './data/products-menu.data';
import { ProductsMegaMenu } from './products-mega-menu/products-mega-menu';

// Píxeles de scroll vertical antes de mostrar el buscador compacto.
export const HEADER_SCROLL_THRESHOLD = 48;
// Official md breakpoint; above 48rem uses desktop/tablet bar, <= 48rem switches to mobile header.
export const PRODUCTS_MENU_MEDIA_QUERY = '(width > 48rem)';
// Allows the pointer to cross the small gap between the link and the overlay.
export const PRODUCTS_MENU_CLOSE_DELAY = 150;

@Component({
  selector: 'app-header',
  imports: [RouterLink, ProductsMegaMenu],
  templateUrl: './header.html',
  styleUrls: [
    './header.scss',
    './header-assets.scss',
    './header-responsive.scss',
    './header-mobile.scss',
    './header-motion.scss',
  ],
  host: {
    '(focusout)': 'onResponsiveFocusOut($event)',
    '(document:keydown.escape)': 'onProductsEscape($event)',
    '(document:pointerdown)': 'onProductsOutsidePointer($event)',
  },
})
export class Header {
  readonly primarySearchRequested = output<void>();

  protected readonly navigationLinks = HEADER_NAVIGATION_LINKS;
  protected readonly productCategories = PRODUCT_MENU_CATEGORIES;
  protected readonly scrolled = signal(false);
  protected readonly searchAttention = signal(false);
  protected readonly productsMenuAvailable = signal(false);
  protected readonly productsMenuOpen = signal(false);
  protected readonly productsMenuPosition = signal({ offset: 0, maxWidth: 0, maxHeight: 0 });
  protected readonly mobileMenuOpen = signal(false);
  protected readonly mobileProductsOpen = signal(false);
  // In mobile (<= 48rem), scrolled keeps the simplified bar (Logo + Search + Menu) without expanding the horizontal input.
  protected readonly compactSearchVisible = computed(
    () => this.scrolled() && this.productsMenuAvailable(),
  );
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly searchButton = viewChild.required<ElementRef<HTMLButtonElement>>('searchButton');
  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly mobileMenu = viewChild.required<ElementRef<HTMLElement>>('mobileMenu');
  private readonly navbar = viewChild.required<ElementRef<HTMLElement>>('navbar');
  private readonly productsTrigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('productsTrigger');
  private readonly productsPanel = viewChild.required(ProductsMegaMenu);
  private readonly productsPanelElement = viewChild.required(ProductsMegaMenu, {
    read: ElementRef,
  });
  private productsCloseTimer: ReturnType<typeof setTimeout> | undefined;
  private productsOpenedAtScrollY = 0;
  private restoringProductsFocus = false;

  constructor() {
    afterNextRender(() => {
      const window = this.document.defaultView;
      if (!window) return;

      const updateScroll = () => {
        const next = window.scrollY > HEADER_SCROLL_THRESHOLD;
        if (
          this.productsMenuOpen() &&
          (Math.abs(window.scrollY - this.productsOpenedAtScrollY) >= 8 || next !== this.scrolled())
        ) {
          this.closeProductsMenu();
        }
        if (!next && this.document.activeElement === this.searchInput().nativeElement) {
          this.searchButton().nativeElement.focus({ preventScroll: true });
        }
        this.scrolled.set(next);
      };

      updateScroll();
      window.addEventListener('scroll', updateScroll, { passive: true });
      const desktop = window.matchMedia?.(PRODUCTS_MENU_MEDIA_QUERY);
      const updateAvailability = () => {
        const isDesktop = desktop ? desktop.matches : true;
        const active = this.document.activeElement;
        // Search remains visible in both layouts; never restore focus to a hidden trigger.
        if (
          isDesktop !== this.productsMenuAvailable() &&
          (isDesktop
            ? this.isMobileMenuTarget(active)
            : this.isProductsTarget(active) ||
              this.navbar().nativeElement.querySelector('nav')?.contains(active) ||
              active === this.searchInput().nativeElement)
        ) {
          this.searchButton().nativeElement.focus({ preventScroll: true });
        }
        this.productsMenuAvailable.set(isDesktop);
        if (isDesktop) {
          this.closeMobileMenu();
        } else {
          this.closeProductsMenu();
          if (this.document.activeElement === this.searchInput().nativeElement) {
            this.searchButton().nativeElement.focus({ preventScroll: true });
          }
        }
      };
      const closeOnResize = () => {
        updateAvailability();
        this.closeProductsMenu();
        if (!desktop || desktop.matches) this.closeMobileMenu();
      };
      updateAvailability();
      desktop?.addEventListener('change', updateAvailability);
      window.addEventListener('resize', closeOnResize);
      window.addEventListener('blur', closeOnResize);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', updateScroll);
        window.removeEventListener('resize', closeOnResize);
        window.removeEventListener('blur', closeOnResize);
        desktop?.removeEventListener('change', updateAvailability);
        this.cancelProductsClose();
      });
    });
  }

  protected openProductsMenu(event?: PointerEvent): void {
    if (
      !this.productsMenuAvailable() ||
      this.restoringProductsFocus ||
      event?.pointerType === 'touch'
    )
      return;
    this.cancelProductsClose();
    if (this.productsMenuOpen()) return;

    const window = this.document.defaultView;
    if (!window) return;
    const navbar = this.navbar().nativeElement;
    const bounds = navbar.getBoundingClientRect();
    const trigger = this.productsTrigger().nativeElement.getBoundingClientRect();
    const padding = parseFloat(window.getComputedStyle(navbar).paddingInlineStart) || 0;
    const offset = Math.max(0, trigger.left - bounds.left - padding);
    const rem = parseFloat(window.getComputedStyle(this.document.documentElement).fontSize) || 16;
    this.productsMenuPosition.set({
      offset,
      maxWidth: Math.max(0, this.document.documentElement.clientWidth - bounds.left * 2 - offset),
      maxHeight: Math.max(0, window.innerHeight - bounds.bottom - rem),
    });
    this.productsOpenedAtScrollY = window.scrollY;
    this.productsMenuOpen.set(true);
  }

  protected enterProductsMenu(event: Event): void {
    if (!this.productsMenuAvailable()) return;
    event.preventDefault();
    this.openProductsMenu();
    afterNextRender(
      () => {
        if (this.productsMenuOpen()) this.productsPanel().focusActiveCategory();
      },
      { injector: this.injector },
    );
  }

  protected cancelProductsClose(): void {
    clearTimeout(this.productsCloseTimer);
    this.productsCloseTimer = undefined;
  }

  protected scheduleProductsClose(): void {
    this.cancelProductsClose();
    this.productsCloseTimer = setTimeout(() => {
      this.productsCloseTimer = undefined;
      if (!this.isProductsTarget(this.document.activeElement)) this.closeProductsMenu();
    }, PRODUCTS_MENU_CLOSE_DELAY);
  }

  protected onProductsFocusOut(event: FocusEvent): void {
    if (!this.isProductsTarget(event.relatedTarget)) this.closeProductsMenu();
  }

  protected onResponsiveFocusOut(event: FocusEvent): void {
    if (event.relatedTarget || !(event.target instanceof Node)) return;
    const desktop = this.document.defaultView?.matchMedia(PRODUCTS_MENU_MEDIA_QUERY).matches;
    const disappears = desktop
      ? this.isMobileMenuTarget(event.target)
      : this.isProductsTarget(event.target) ||
        this.navbar().nativeElement.querySelector('nav')?.contains(event.target) ||
        event.target === this.searchInput().nativeElement;
    if (!disappears) return;
    // CSS can hide the focused control before the media-query change callback fires.
    afterNextRender(() => this.searchButton().nativeElement.focus({ preventScroll: true }), {
      injector: this.injector,
    });
  }

  protected closeProductsMenu(restoreFocus = false): void {
    this.cancelProductsClose();
    if (!this.productsMenuOpen()) return;
    this.productsMenuOpen.set(false);
    const panel = this.productsPanelElement().nativeElement as HTMLElement;
    if (restoreFocus || panel.contains(this.document.activeElement)) {
      this.restoringProductsFocus = true;
      this.productsTrigger().nativeElement.focus({ preventScroll: true });
      this.restoringProductsFocus = false;
    }
  }

  protected toggleMobileMenu(): void {
    if (this.mobileMenuOpen()) {
      this.closeMobileMenu();
      return;
    }
    this.closeProductsMenu();
    this.mobileMenuOpen.set(true);
  }

  protected closeMobileMenu(restoreFocus = false): void {
    if (!this.mobileMenuOpen()) return;
    this.mobileMenuOpen.set(false);
    this.mobileProductsOpen.set(false);
    const panel = this.mobileMenu().nativeElement;
    if (restoreFocus || panel.contains(this.document.activeElement)) {
      this.menuButton().nativeElement.focus({ preventScroll: true });
    }
  }

  protected toggleMobileProducts(): void {
    this.mobileProductsOpen.update((open) => !open);
  }

  protected onProductsEscape(event: Event): void {
    if (this.mobileMenuOpen()) {
      event.preventDefault();
      event.stopPropagation();
      this.closeMobileMenu(true);
      return;
    }
    if (!this.productsMenuOpen()) return;
    event.preventDefault();
    event.stopPropagation();
    this.closeProductsMenu(true);
  }

  protected onProductsOutsidePointer(event: PointerEvent): void {
    if (!this.isProductsTarget(event.target)) this.closeProductsMenu();
    if (this.mobileMenuOpen() && !this.isMobileMenuTarget(event.target)) {
      this.closeMobileMenu();
    }
  }

  private isProductsTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    return (
      this.productsTrigger().nativeElement.contains(target) ||
      (this.productsPanelElement().nativeElement as HTMLElement).contains(target)
    );
  }

  private isMobileMenuTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    return (
      this.menuButton().nativeElement.contains(target) ||
      this.mobileMenu().nativeElement.contains(target)
    );
  }

  protected requestSearch(): void {
    this.closeMobileMenu();
    if (this.compactSearchVisible()) {
      this.searchInput().nativeElement.focus({ preventScroll: true });
      return;
    }

    if (this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.primarySearchRequested.emit();
      return;
    }

    this.searchAttention.set(true);
  }

  protected finishSearchAttention(event: AnimationEvent): void {
    if (!event.animationName.endsWith('header-search-bounce') || !this.searchAttention()) return;
    this.searchAttention.set(false);
    this.primarySearchRequested.emit();
  }
}
