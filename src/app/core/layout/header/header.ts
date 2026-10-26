import {
  afterNextRender,
  Component,
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
import { ProductsMegaMenu } from './products-mega-menu/products-mega-menu';

// Píxeles de scroll vertical antes de mostrar el buscador compacto.
export const HEADER_SCROLL_THRESHOLD = 48;
// Official xl breakpoint; the desktop panel is not a mobile navigation solution.
export const PRODUCTS_MENU_MEDIA_QUERY = '(width > 80rem)';
// Allows the pointer to cross the small gap between the link and the overlay.
export const PRODUCTS_MENU_CLOSE_DELAY = 150;

@Component({
  selector: 'app-header',
  imports: [RouterLink, ProductsMegaMenu],
  templateUrl: './header.html',
  styleUrls: ['./header.scss', './header-responsive.scss', './header-motion.scss'],
  host: {
    '(document:keydown.escape)': 'onProductsEscape($event)',
    '(document:pointerdown)': 'onProductsOutsidePointer($event)',
  },
})
export class Header {
  readonly primarySearchRequested = output<void>();

  protected readonly scrolled = signal(false);
  protected readonly searchAttention = signal(false);
  protected readonly productsMenuAvailable = signal(false);
  protected readonly productsMenuOpen = signal(false);
  protected readonly productsMenuPosition = signal({ offset: 0, maxWidth: 0, maxHeight: 0 });
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly searchButton = viewChild.required<ElementRef<HTMLButtonElement>>('searchButton');
  private readonly navbar = viewChild.required<ElementRef<HTMLElement>>('navbar');
  private readonly productsTrigger =
    viewChild.required<ElementRef<HTMLAnchorElement>>('productsTrigger');
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
      const desktop = window.matchMedia(PRODUCTS_MENU_MEDIA_QUERY);
      const updateAvailability = () => {
        this.productsMenuAvailable.set(desktop.matches);
        if (!desktop.matches) this.closeProductsMenu();
      };
      const closeOnResize = () => this.closeProductsMenu();
      updateAvailability();
      desktop.addEventListener('change', updateAvailability);
      window.addEventListener('resize', closeOnResize);
      window.addEventListener('blur', closeOnResize);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', updateScroll);
        window.removeEventListener('resize', closeOnResize);
        window.removeEventListener('blur', closeOnResize);
        desktop.removeEventListener('change', updateAvailability);
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

  protected onProductsEscape(event: Event): void {
    if (!this.productsMenuOpen()) return;
    event.preventDefault();
    event.stopPropagation();
    this.closeProductsMenu(true);
  }

  protected onProductsOutsidePointer(event: PointerEvent): void {
    if (!this.isProductsTarget(event.target)) this.closeProductsMenu();
  }

  private isProductsTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    return (
      this.productsTrigger().nativeElement.contains(target) ||
      (this.productsPanelElement().nativeElement as HTMLElement).contains(target)
    );
  }

  protected requestSearch(): void {
    if (this.scrolled()) {
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
