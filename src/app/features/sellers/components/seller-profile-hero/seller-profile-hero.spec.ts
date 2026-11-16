import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LDF_PROJECTS_SELLER } from '../../data/seller-profile.data';
import { SellerProfile } from '../../models/seller-profile.model';
import { SellerProfileHero } from './seller-profile-hero';

describe('SellerProfileHero', () => {
  let fixture: ComponentFixture<SellerProfileHero>;
  let element: HTMLElement;

  async function setSeller(changes: Partial<SellerProfile> = {}): Promise<void> {
    fixture.componentRef.setInput('seller', { ...LDF_PROJECTS_SELLER, ...changes });
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SellerProfileHero] }).compileComponents();
    fixture = TestBed.createComponent(SellerProfileHero);
    element = fixture.nativeElement;
    await setSeller();
  });

  it('renders the seller identity and available location from its input', async () => {
    expect(element.querySelector('h1')?.textContent).toBe(LDF_PROJECTS_SELLER.name);
    expect(element.querySelector('.seller-hero__sector')?.textContent).toBe(
      LDF_PROJECTS_SELLER.sector,
    );
    expect(element.querySelector('.seller-hero__location')?.textContent?.trim()).toBe(
      'San Miguel, Lima',
    );
    await setSeller({
      location: { ...LDF_PROJECTS_SELLER.location, district: '' },
    });
    expect(element.querySelector('.seller-hero__location')?.textContent?.trim()).toBe('Lima');
  });

  it('only renders the verified badge for verified sellers', async () => {
    expect(element.querySelector('[aria-label="Proveedor verificado"]')).not.toBeNull();
    await setSeller({ verified: false });
    expect(element.querySelector('.seller-hero__verified')).toBeNull();
  });

  it('updates tags and formatted stats from seller data', async () => {
    expect(
      Array.from(element.querySelectorAll('.seller-hero__tags li')).map((tag) => tag.textContent),
    ).toEqual(LDF_PROJECTS_SELLER.tags);
    expect(element.querySelector('.seller-hero__stats')?.textContent).toContain('+200 productos');
    expect(element.querySelector('.seller-hero__stats')?.textContent).toContain('+12 años');
    await setSeller({ tags: ['Automatización'], productCount: 1250, years: 8 });
    expect(element.querySelectorAll('.seller-hero__tags li')).toHaveLength(1);
    expect(element.querySelector('.seller-hero__tags')?.textContent).toContain('Automatización');
    expect(element.querySelector('.seller-hero__stats')?.textContent).toContain('+1,250 productos');
    expect(element.querySelector('.seller-hero__stats')?.textContent).toContain('+8 años');
  });

  it('renders shared semantic buttons and emits contact and share intentions', () => {
    const contact = vi.fn();
    const share = vi.fn();
    fixture.componentInstance.contactRequest.subscribe(contact);
    fixture.componentInstance.shareRequest.subscribe(share);
    const buttons = element.querySelectorAll<HTMLButtonElement>('app-button button');
    expect(Array.from(buttons).map((button) => button.textContent?.trim())).toEqual([
      'Contactarnos',
      'Compartir',
    ]);
    expect(Array.from(buttons).every((button) => button.type === 'button')).toBe(true);
    buttons[0].click();
    expect(contact).toHaveBeenCalledOnce();
    expect(share).not.toHaveBeenCalled();
    buttons[1].click();
    expect(share).toHaveBeenCalledOnce();
  });

  it('keeps a decorative cover slot when the asset is absent or fails', async () => {
    const cover = element.querySelector<HTMLImageElement>('.seller-hero__cover img')!;
    expect(cover.getAttribute('src')).toBe('/assets/sellers/ldf-projects/cover.webp');
    expect(cover.alt).toBe('');
    expect(cover.parentElement?.getAttribute('aria-hidden')).toBe('true');
    cover.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(cover.style.visibility).toBe('hidden');
    await setSeller({ coverImage: undefined });
    expect(element.querySelector('.seller-hero__cover')).not.toBeNull();
    expect(element.querySelector('.seller-hero__cover img')).toBeNull();
    await setSeller({ coverImage: '/assets/sellers/ldf-projects/cover.webp' });
    const restoredCover = element.querySelector<HTMLImageElement>('.seller-hero__cover img')!;
    restoredCover.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(restoredCover.style.visibility).toBe('visible');
  });

  it('preserves logo identity without a broken image and resets when the source changes', async () => {
    const logo = element.querySelector<HTMLImageElement>('.seller-hero__logo img')!;
    expect(logo.alt).toBe('Logo de LDF Projects');
    expect(logo.getAttribute('src')).toBe(LDF_PROJECTS_SELLER.logo);
    logo.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(logo.style.visibility).toBe('hidden');
    expect(element.querySelector('.seller-hero__logo-fallback')?.getAttribute('aria-label')).toBe(
      'Logo de LDF Projects',
    );
    await setSeller({ logo: '/assets/sellers/ldf-projects/logo.webp' });
    expect(logo.getAttribute('src')).toBe('/assets/sellers/ldf-projects/logo.webp');
    logo.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(logo.style.visibility).toBe('visible');
    expect(element.querySelector('.seller-hero__logo-fallback')).toBeNull();
  });

  it('replaces the verified fallback when the original icon loads', async () => {
    const icon = element.querySelector<HTMLImageElement>('.seller-hero__verified-icon img')!;
    expect(icon.getAttribute('src')).toBe('/assets/icons/seller/verified.svg');
    icon.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(icon.style.visibility).toBe('hidden');
    expect(element.querySelector('.seller-hero__verified-icon span')?.textContent).toBe('✓');
    icon.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(icon.style.visibility).toBe('visible');
    expect(element.querySelector('.seller-hero__verified-icon span')).toBeNull();
  });
});
