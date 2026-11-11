import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../../app.routes';
import { SellerProfileHero } from '../../components/seller-profile-hero/seller-profile-hero';
import { SellerProducts } from '../../components/seller-products/seller-products';
import { SellerBrands } from '../../components/seller-brands/seller-brands';
import { SELLER_PRODUCTS } from '../../data/seller-products.data';
import { LDF_PROJECTS_SELLER } from '../../data/seller-profile.data';
import { SellerProfilePage } from './seller-profile-page';

describe('SellerProfilePage', () => {
  let harness: RouterTestingHarness;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
    harness = await RouterTestingHarness.create('/proveedores/ldf-projects');
    element = harness.routeNativeElement!;
  });

  function pageInstance(): SellerProfilePage {
    return harness.fixture.debugElement.query(By.directive(SellerProfilePage)).componentInstance;
  }

  it('loads the lazy page inside the existing global layout', () => {
    expect(pageInstance()).toBeInstanceOf(SellerProfilePage);
    expect(element.querySelectorAll('app-header')).toHaveLength(1);
    expect(element.querySelectorAll('app-footer')).toHaveLength(1);
    expect(element.querySelectorAll('app-floating-actions')).toHaveLength(1);
    expect(element.querySelector('main app-seller-profile-page')).not.toBeNull();
  });

  it('resolves the mock with the requested seller id and exposes its data', () => {
    const seller = pageInstance()['seller']();
    expect(seller).toBe(LDF_PROJECTS_SELLER);
    expect(seller?.id).toBe('ldf-projects');
    const hero: SellerProfileHero = harness.fixture.debugElement.query(
      By.directive(SellerProfileHero),
    ).componentInstance;
    expect(hero.seller()).toBe(seller);
    expect(element.querySelector('app-seller-profile-page h1')?.textContent).toBe(seller?.name);
    expect(element.querySelector('.seller-profile__hero')?.textContent).toContain('San Miguel');
  });

  it('places the hero, navigation and six section destinations in the expected order', () => {
    const shell = element.querySelector('.seller-profile')!;
    expect(Array.from(shell.children).map((child) => child.tagName)).toEqual([
      'APP-SELLER-PROFILE-HERO',
      'P',
      'APP-SELLER-SECTION-NAV',
      'SECTION',
      'SECTION',
      'SECTION',
      'SECTION',
      'SECTION',
      'SECTION',
    ]);
    expect(Array.from(shell.querySelectorAll('section')).map((section) => section.id)).toEqual([
      'productos',
      'marcas',
      'perfil',
      'informacion',
      'certificaciones',
      'ubicacion',
    ]);
    expect(Array.from(shell.querySelectorAll('h2')).map((heading) => heading.textContent)).toEqual([
      'Productos',
      'Marcas',
      'Perfil',
      'Información',
      'Certificaciones',
      'Ubicación',
    ]);
    const products: SellerProducts = harness.fixture.debugElement.query(
      By.directive(SellerProducts),
    ).componentInstance;
    const brands: SellerBrands = harness.fixture.debugElement.query(
      By.directive(SellerBrands),
    ).componentInstance;
    expect(products.products()).toBe(SELLER_PRODUCTS['ldf-projects']);
    expect(brands.brands()).toBe(LDF_PROJECTS_SELLER.brands);
    expect(shell.querySelector('#productos app-seller-products')).not.toBeNull();
    expect(shell.querySelector('#marcas app-seller-brands')).not.toBeNull();
  });

  it('provides a unique labelled destination for each native fragment link', () => {
    const page = element.querySelector('app-seller-profile-page')!;
    const links = page.querySelectorAll<HTMLAnchorElement>('nav a');
    expect(links).toHaveLength(6);
    links.forEach((link) => {
      expect(link.pathname).toBe('/proveedores/ldf-projects');
      const targets = page.querySelectorAll<HTMLElement>(link.hash);
      expect(targets).toHaveLength(1);
      expect(targets[0].tabIndex).toBe(-1);
      expect(targets[0].querySelector('h2')?.id).toBe(targets[0].getAttribute('aria-labelledby'));
      expect(targets[0].querySelector('h2')?.textContent?.trim()).toBe(link.textContent?.trim());
    });
  });

  it('reacts to id changes and restores the profile after an unknown seller', async () => {
    const initialPage = pageInstance();
    await harness.navigateByUrl('/proveedores/unknown');
    expect(pageInstance()).toBe(initialPage);
    expect(pageInstance()['seller']()).toBeUndefined();
    expect(element.querySelector('app-seller-profile-page h1')?.textContent).toBe(
      'Proveedor no encontrado',
    );
    expect(element.querySelector('.seller-profile__nav')).toBeNull();
    expect(element.querySelector('app-seller-profile-hero')).toBeNull();
    expect(element.querySelectorAll('.seller-profile__section')).toHaveLength(0);
    await harness.navigateByUrl('/proveedores/ldf-projects');
    expect(pageInstance()['seller']()).toBe(LDF_PROJECTS_SELLER);
    expect(element.querySelectorAll('.seller-profile__section')).toHaveLength(6);
  });

  it('acknowledges hero actions locally and clears the message when the seller changes', async () => {
    const buttons = element.querySelectorAll<HTMLButtonElement>('app-seller-profile-hero button');
    buttons[0].click();
    await harness.fixture.whenStable();
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'No se ha enviado ninguna solicitud.',
    );
    buttons[1].click();
    await harness.fixture.whenStable();
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'La opción de compartir este perfil estará disponible próximamente.',
    );
    await harness.navigateByUrl('/proveedores/unknown');
    await harness.navigateByUrl('/proveedores/ldf-projects');
    expect(element.querySelector('[role="status"]')?.textContent).toBe('');
  });

  it('handles a direct unknown URL and returns to products through the router', async () => {
    await harness.navigateByUrl('/productos');
    await harness.navigateByUrl('/proveedores/unknown');
    expect(element.querySelector('app-seller-profile-page h1')?.textContent).toBe(
      'Proveedor no encontrado',
    );
    const backLink = element.querySelector<HTMLAnchorElement>('.seller-profile__empty a')!;
    expect(backLink.textContent).toBe('Volver a productos');
    expect(backLink.getAttribute('href')).toBe('/productos');
    backLink.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/productos');
    expect(element.querySelector('app-product-list-page')).not.toBeNull();
  });
});
