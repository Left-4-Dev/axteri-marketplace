import { ComponentFixture, TestBed } from '@angular/core/testing';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductDescriptionContent } from '../../models/product-detail.model';
import { ProductDescription } from './product-description';

describe('ProductDescription', () => {
  let fixture: ComponentFixture<ProductDescription>;
  let element: HTMLElement;
  const content = W22_PRODUCT_DETAIL.detailedDescription;

  async function render(value: ProductDescriptionContent = content): Promise<void> {
    fixture = TestBed.createComponent(ProductDescription);
    fixture.componentRef.setInput('description', value);
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductDescription] }).compileComponents();
  });

  it('renders the section heading', async () => {
    await render();
    expect(element.querySelector('h2')?.textContent).toBe('Descripción');
  });

  it('renders heading, paragraphs and highlights from the typed input', async () => {
    await render();
    const card = element.querySelector('.product-description__card')!;
    expect(card.querySelector('h3')?.textContent).toBe(content.heading);

    const paragraphs = Array.from(card.querySelectorAll(':scope > p')).map((p) => p.textContent);
    expect(paragraphs).toEqual(content.paragraphs);

    expect(card.querySelector('h4')?.textContent).toBe(content.highlightsTitle);
    const highlights = Array.from(card.querySelectorAll('li')).map((item) => item.textContent);
    expect(highlights).toEqual(content.highlights);
  });

  it('adapts dynamically to custom content and omits highlights when absent', async () => {
    await render({
      heading: 'Descripción personalizada',
      paragraphs: ['Primer párrafo técnico.', 'Segundo párrafo técnico.'],
    });
    const card = element.querySelector('.product-description__card')!;
    expect(card.querySelector('h3')?.textContent).toBe('Descripción personalizada');
    expect(card.querySelectorAll(':scope > p')).toHaveLength(2);
    expect(card.querySelector('.product-description__highlights')).toBeNull();
  });

  it('renders the virtual assistant banner with the shared light button', async () => {
    await render();
    const banner = element.querySelector('aside.product-description__banner')!;
    expect(banner.querySelector('.product-description__badge')?.textContent).toBe('IA');
    expect(banner.querySelector('h3')?.textContent).toBe('¿Tienes alguna consulta?');
    expect(banner.textContent).toContain('Pregúntale a nuestro asistente virtual');

    const sharedButton = banner.querySelector('app-button');
    const nativeButton = sharedButton?.querySelector('button');
    expect(sharedButton).not.toBeNull();
    expect(nativeButton?.type).toBe('button');
    expect(nativeButton?.classList.contains('button--light')).toBe(true);
    expect(nativeButton?.textContent?.trim()).toBe('Consultar');
  });

  it('emits consultationRequest and announces honest local status when clicking the CTA', async () => {
    await render();
    const spy = vi.fn();
    fixture.componentInstance.consultationRequest.subscribe(spy);

    expect(element.querySelector('[role="status"]')?.textContent?.trim()).toBe('');
    element.querySelector<HTMLButtonElement>('app-button button')!.click();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'estará disponible próximamente',
    );

    fixture.componentRef.setInput('description', {
      heading: 'Otro producto',
      paragraphs: ['Descripción alternativa.'],
    });
    await fixture.whenStable();
    expect(element.querySelector('[role="status"]')?.textContent?.trim()).toBe('');
  });
});
