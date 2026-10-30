import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let element: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        provideRouter([
          { path: '', children: [] },
          { path: 'other', children: [] },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Footer);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the semantic footer, brand logo link, description, and decorative wordmark', () => {
    const footer = element.querySelector('footer.footer');
    const brandLink = element.querySelector<HTMLAnchorElement>('.footer__brand-link');
    const logo = brandLink?.querySelector<HTMLImageElement>('img.footer__logo');
    const description = element.querySelector<HTMLParagraphElement>('.footer__description');
    const wordmark = element.querySelector<HTMLElement>('.footer__wordmark');

    expect(footer).not.toBeNull();
    expect(brandLink?.getAttribute('href')).toBe('/');
    expect(brandLink?.getAttribute('aria-label')).toBe('Axteri, inicio');
    expect(logo?.getAttribute('src')).toBe('/assets/logos/axteri-logo.svg');
    expect(logo?.getAttribute('alt')).toBe('');
    expect(description?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Centralizamos productos, marcas, cotizaciones y entregas dentro de un solo ecosistema para garantizar eficiencia y estabilidad completa en todo el proceso de adquisición.',
    );
    expect(wordmark?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the column headings and labeled navigation landmarks', () => {
    const headings = Array.from(element.querySelectorAll('h2'), (heading) =>
      heading.textContent?.trim(),
    );
    const navLabels = Array.from(element.querySelectorAll('nav'), (nav) =>
      nav.getAttribute('aria-labelledby'),
    );

    expect(headings).toEqual(['Explorar', 'Empresa', 'Ayuda', 'Nuestras redes']);
    expect(navLabels).toEqual(['footer-explore', 'footer-company', 'footer-help']);
  });

  it('renders real Home navigation links in Explorar and updates active state with the router', async () => {
    const exploreLinks = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('nav[aria-labelledby="footer-explore"] a'),
    );

    expect(
      exploreLinks.map((link) => ({
        label: link.textContent?.trim(),
        href: link.getAttribute('href'),
      })),
    ).toEqual([
      { label: 'Inicio', href: '/' },
      { label: 'Categorías', href: '/#categories' },
      { label: 'Oferta', href: '/#limited-offers' },
      { label: 'Noticias', href: '/#news' },
    ]);

    expect(exploreLinks[0].classList.contains('footer__link--active')).toBe(true);
    expect(exploreLinks[0].getAttribute('aria-current')).toBe('page');
    expect(exploreLinks[1].classList.contains('footer__link--active')).toBe(false);

    await router.navigateByUrl('/#categories');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(exploreLinks[0].classList.contains('footer__link--active')).toBe(false);
    expect(exploreLinks[1].classList.contains('footer__link--active')).toBe(true);
    expect(exploreLinks[1].getAttribute('aria-current')).toBe('page');

    await router.navigateByUrl('/other');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(exploreLinks.some((link) => link.classList.contains('footer__link--active'))).toBe(
      false,
    );
  });

  it('keeps pending Empresa, Ayuda, and social items accessible without fake links', () => {
    const disabledLinks = Array.from(
      element.querySelectorAll<HTMLElement>('.footer__link--disabled'),
      (item) => ({
        text: item.textContent?.trim(),
        disabled: item.getAttribute('aria-disabled'),
      }),
    );

    expect(disabledLinks).toEqual([
      { text: 'Acerca de nosotros', disabled: 'true' },
      { text: 'Vende en Axteri', disabled: 'true' },
      { text: 'Atención al cliente', disabled: 'true' },
      { text: 'Centro de ayuda', disabled: 'true' },
      { text: 'Libro de reclamaciones', disabled: 'true' },
    ]);

    const socialItems = Array.from(
      element.querySelectorAll<HTMLElement>('.footer__social .footer__social-item'),
      (item) => ({
        tag: item.tagName,
        label: item.getAttribute('aria-label'),
        text: item.textContent?.trim(),
        disabled: item.getAttribute('aria-disabled'),
      }),
    );

    expect(socialItems).toEqual([
      { tag: 'SPAN', label: 'Facebook', text: 'Facebook', disabled: 'true' },
      { tag: 'SPAN', label: 'Instagram', text: 'Instagram', disabled: 'true' },
      { tag: 'SPAN', label: 'TikTok', text: 'TikTok', disabled: 'true' },
      { tag: 'SPAN', label: 'YouTube', text: 'YouTube', disabled: 'true' },
    ]);

    const anchors = Array.from(element.querySelectorAll<HTMLAnchorElement>('a'));
    expect(anchors).toHaveLength(5);
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });

  it('renders copyright with the current year dynamically', () => {
    const currentYear = new Date().getFullYear();
    const copyright = element.querySelector<HTMLParagraphElement>('.footer__copyright');

    expect(copyright?.textContent?.trim()).toBe(
      `© ${currentYear} AXTERI | TODOS LOS DERECHOS RESERVADOS.`,
    );
  });
});
