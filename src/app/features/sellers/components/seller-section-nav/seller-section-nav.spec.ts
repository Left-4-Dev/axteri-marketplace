import { TestBed } from '@angular/core/testing';
import { SellerSectionNav } from './seller-section-nav';

describe('SellerSectionNav', () => {
  it('scrolls and focuses the native destination while keeping modified clicks native', async () => {
    const fixture = TestBed.createComponent(SellerSectionNav);
    fixture.componentRef.setInput('sections', [{ id: 'productos', label: 'Productos' }]);
    fixture.componentRef.setInput('profilePath', window.location.pathname);
    const target = document.createElement('section');
    target.id = 'productos';
    target.tabIndex = -1;
    target.scrollIntoView = vi.fn();
    document.body.append(target);
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => undefined);
    try {
      await fixture.whenStable();
      const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
      const click = new MouseEvent('click', { cancelable: true });
      link.dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(target.scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
      expect(document.activeElement).toBe(target);
      expect(pushState).toHaveBeenCalledWith(
        window.history.state,
        '',
        window.location.pathname + '#productos',
      );
      const modifiedClick = new MouseEvent('click', { cancelable: true, ctrlKey: true });
      fixture.componentInstance['navigate'](modifiedClick, 'productos');
      expect(modifiedClick.defaultPrevented).toBe(false);
    } finally {
      pushState.mockRestore();
      target.remove();
    }
  });

  it('renders six native links to the profile destinations', async () => {
    const fixture = TestBed.createComponent(SellerSectionNav);
    const ids = ['productos', 'marcas', 'perfil', 'informacion', 'certificaciones', 'ubicacion'];
    fixture.componentRef.setInput(
      'sections',
      ids.map((id) => ({ id, label: id })),
    );
    fixture.componentRef.setInput('profilePath', '/proveedores/ldf-projects');
    await fixture.whenStable();
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
    expect(links).toHaveLength(6);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      ids.map((id) => '/proveedores/ldf-projects#' + id),
    );
  });
});
