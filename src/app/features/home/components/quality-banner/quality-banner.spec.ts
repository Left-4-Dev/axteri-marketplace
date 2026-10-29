import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QualityBanner } from './quality-banner';

describe('QualityBanner', () => {
  let fixture: ComponentFixture<QualityBanner>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualityBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(QualityBanner);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('renders the section with its accessible heading relationship', () => {
    const section = element.querySelector<HTMLElement>('section#quality-banner');
    const heading = element.querySelector<HTMLHeadingElement>('#quality-banner-title');

    expect(section).not.toBeNull();
    expect(section?.getAttribute('aria-labelledby')).toBe('quality-banner-title');
    expect(heading?.tagName).toBe('H2');
  });

  it('renders the heading hierarchy with CALIDAD semantically highlighted inside mark', () => {
    const heading = element.querySelector<HTMLHeadingElement>('#quality-banner-title');
    const highlight = heading?.querySelector<HTMLElement>('mark.quality-banner__highlight');
    const normalizedText = heading?.textContent?.replace(/\s+/g, ' ').trim();

    expect(normalizedText).toBe('PRODUCTOS DE CALIDAD');
    expect(highlight).not.toBeNull();
    expect(highlight?.textContent?.trim()).toBe('CALIDAD');
  });

  it('renders the certification subtitle below the heading', () => {
    const subtitle = element.querySelector<HTMLParagraphElement>('.quality-banner__subtitle');
    const normalizedSubtitle = subtitle?.textContent?.replace(/\s+/g, ' ').trim();

    expect(normalizedSubtitle).toBe('NUESTROS PROVEEDORES CUENTAN CON CERTIFICACIÓN');
  });

  it('shows the pending photograph placeholder by default and renders an image when imageUrl is provided', () => {
    expect(element.querySelector('.quality-banner__placeholder')?.textContent?.trim()).toBe(
      'Fotografía pendiente',
    );
    expect(element.querySelector('img.quality-banner__image')).toBeNull();

    fixture.componentRef.setInput('imageUrl', '/assets/quality-provider.jpg');
    fixture.detectChanges();

    const image = element.querySelector<HTMLImageElement>('img.quality-banner__image');
    expect(image).not.toBeNull();
    expect(image?.getAttribute('src')).toBe('/assets/quality-provider.jpg');
    expect(image?.getAttribute('alt')).toBe('');
    expect(element.querySelector('.quality-banner__placeholder')).toBeNull();
  });

  it('restores the placeholder when the image input is cleared', () => {
    fixture.componentRef.setInput('imageUrl', '/assets/quality-provider.jpg');
    fixture.detectChanges();
    fixture.componentRef.setInput('imageUrl', undefined);
    fixture.detectChanges();

    expect(element.querySelector('.quality-banner__placeholder')).not.toBeNull();
    expect(element.querySelector('img')).toBeNull();
  });

  it('keeps the pause motif decorative and outside the keyboard and accessibility controls', () => {
    const notch = element.querySelector<HTMLElement>('.quality-banner__notch');
    const pause = notch?.querySelector<HTMLElement>('.quality-banner__pause');

    expect(notch?.getAttribute('aria-hidden')).toBe('true');
    expect(pause).not.toBeNull();
    expect(pause?.tabIndex).toBe(-1);
    expect(element.querySelector('button, [role="button"], [tabindex]')).toBeNull();
    expect(pause?.querySelector('.quality-banner__pause-icon')).not.toBeNull();
  });
});
