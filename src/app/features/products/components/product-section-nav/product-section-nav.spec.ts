import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductSectionNav } from './product-section-nav';

describe('ProductSectionNav', () => {
  let fixture: ComponentFixture<ProductSectionNav>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductSectionNav] }).compileComponents();
    fixture = TestBed.createComponent(ProductSectionNav);
    fixture.componentRef.setInput('productId', 'weg-w22-3kw');
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  it('provides a named navigation landmark with six links in the reference order', () => {
    const nav = element.querySelector('nav[aria-label="Secciones del producto"]')!;
    expect(nav).not.toBeNull();
    expect(Array.from(nav.querySelectorAll('a'), (link) => link.textContent?.trim())).toEqual([
      'Características',
      'Descripción',
      'Documentos',
      'Accesorios',
      'Variaciones',
      'Reseñas',
    ]);
    expect(nav.querySelector('[role="tablist"]')).toBeNull();
    expect(nav.querySelector('button')).toBeNull();
  });

  it('links to the current product and the six permanent fragment IDs', () => {
    expect(Array.from(element.querySelectorAll('a'), (link) => link.getAttribute('href'))).toEqual([
      '/productos/weg-w22-3kw#caracteristicas',
      '/productos/weg-w22-3kw#descripcion',
      '/productos/weg-w22-3kw#documentos',
      '/productos/weg-w22-3kw#accesorios',
      '/productos/weg-w22-3kw#variaciones',
      '/productos/weg-w22-3kw#resenas',
    ]);
  });

  it('updates the native href when the product changes', async () => {
    fixture.componentRef.setInput('productId', 'otro-producto');
    await fixture.whenStable();
    expect(element.querySelector('a')?.getAttribute('href')).toBe(
      '/productos/otro-producto#caracteristicas',
    );
  });
});
