import { ComponentFixture, TestBed } from '@angular/core/testing';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductDocument } from '../../models/product-detail.model';
import { ProductDocuments } from './product-documents';

describe('ProductDocuments', () => {
  let fixture: ComponentFixture<ProductDocuments>;
  let element: HTMLElement;
  const dataset = W22_PRODUCT_DETAIL.documents;

  async function render(value: readonly ProductDocument[] = dataset): Promise<void> {
    fixture = TestBed.createComponent(ProductDocuments);
    fixture.componentRef.setInput('documents', value);
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductDocuments] }).compileComponents();
  });

  it('renders the section heading', async () => {
    await render();
    expect(element.querySelector('h2')?.textContent).toBe('Documentos');
  });

  it('renders the full dataset in order with titles and metadata', async () => {
    await render();
    const cards = Array.from(element.querySelectorAll('.product-documents__card'));
    expect(cards).toHaveLength(dataset.length);

    expect(cards.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual(
      dataset.map((doc) => doc.title),
    );
    cards.forEach((card, index) => {
      const doc = dataset[index];
      expect(card.querySelector('.product-documents__file')?.textContent).toContain(doc.fileName);
      expect(card.querySelector('.product-documents__meta')?.textContent).toContain(doc.format);
      expect(card.querySelector('.product-documents__meta')?.textContent).toContain(doc.category);
    });
  });

  it('tracks items by stable document id when the list order changes', async () => {
    await render();
    const firstCardBefore = element.querySelectorAll('.product-documents__card')[0];

    fixture.componentRef.setInput('documents', [...dataset].reverse());
    await fixture.whenStable();

    const cardsAfter = element.querySelectorAll('.product-documents__card');
    expect(cardsAfter[cardsAfter.length - 1]).toBe(firstCardBefore);
  });

  it('does not render invalid or deceptive download links when no real file is supplied', async () => {
    await render([
      {
        id: 'missing',
        title: 'Ficha sin archivo',
        fileName: 'ficha.pdf',
        format: 'PDF',
        category: 'Catálogo',
      },
      {
        id: 'hash',
        title: 'Enlace hash inválido',
        fileName: 'hash.pdf',
        format: 'PDF',
        category: 'Catálogo',
        href: '#',
      },
      {
        id: 'script',
        title: 'Enlace script inválido',
        fileName: 'script.pdf',
        format: 'PDF',
        category: 'Catálogo',
        href: 'javascript:void(0)',
      },
    ]);

    expect(element.querySelectorAll('a')).toHaveLength(0);
    expect(element.querySelectorAll('.product-documents__pending')).toHaveLength(3);
  });

  it('renders a semantic download link when a valid href is provided', async () => {
    await render([
      {
        id: 'real-doc',
        title: 'Ficha técnica',
        fileName: 'ficha-tecnica.pdf',
        format: 'PDF',
        category: 'Catálogo técnico',
        href: '/assets/docs/ficha-tecnica.pdf',
      },
    ]);

    const link = element.querySelector<HTMLAnchorElement>('a.product-documents__link');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/assets/docs/ficha-tecnica.pdf');
    expect(link?.hasAttribute('download')).toBe(true);
    expect(link?.getAttribute('aria-label')).toBe('Descargar Ficha técnica (PDF)');
    expect(element.querySelector('.product-documents__pending')).toBeNull();
  });
});
