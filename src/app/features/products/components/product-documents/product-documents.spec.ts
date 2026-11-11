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

  function cards(): Element[] {
    return Array.from(element.querySelectorAll('.product-documents__card'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductDocuments] }).compileComponents();
  });

  it('renders the section heading', async () => {
    await render();
    expect(element.querySelector('h2')?.textContent).toBe('Documentos');
  });

  it('renders the five documents in order, labelled by their file name', async () => {
    await render();
    expect(cards()).toHaveLength(5);
    expect(
      cards().map((card) => card.querySelector('.product-documents__name')?.textContent?.trim()),
    ).toEqual(dataset.map((doc) => doc.fileName));
    expect(dataset.map((doc) => doc.id)).toEqual([
      'environmental-sheet',
      'technical-datasheet',
      'dimensional-drawing',
      'maintenance-guide',
      'certifications',
    ]);
  });

  it('does not repeat title and metadata next to the file name', async () => {
    await render();
    expect(element.querySelector('h3')).toBeNull();
    expect(element.querySelector('.product-documents__pending')).toBeNull();
    expect(element.querySelector('.product-documents__meta')).toBeNull();
  });

  it('tracks items by stable document id when the list order changes', async () => {
    await render();
    const firstCardBefore = element.querySelectorAll('.product-documents__item')[0];

    fixture.componentRef.setInput('documents', [...dataset].reverse());
    await fixture.whenStable();

    const itemsAfter = element.querySelectorAll('.product-documents__item');
    expect(itemsAfter[itemsAfter.length - 1]).toBe(firstCardBefore);
  });

  it('uses the supplied previewImage with a descriptive alternative text', async () => {
    await render();
    const images = Array.from(element.querySelectorAll<HTMLImageElement>('img'));
    expect(images).toHaveLength(dataset.length);
    images.forEach((image, index) => {
      expect(image.getAttribute('src')).toBe(dataset[index].previewImage);
      expect(image.getAttribute('alt')).toBe(`Vista previa de ${dataset[index].title}`);
    });
  });

  it('accepts a remote previewImage without assuming a local asset path', async () => {
    await render([
      {
        id: 'remote',
        title: 'Remoto',
        fileName: 'remoto.pdf',
        format: 'PDF',
        previewImage: 'https://cdn.example.com/previews/remoto.webp',
      },
    ]);
    expect(element.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.example.com/previews/remoto.webp',
    );
  });

  it('keeps the schematic fallback when previewImage is missing', async () => {
    await render([
      { id: 'no-preview', title: 'Sin vista', fileName: 'sin-vista.pdf', format: 'PDF' },
    ]);
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.product-documents__sheet')).not.toBeNull();
    expect(element.querySelector('.product-documents__sheet-tag')).toBeNull();
  });

  it('shows the schematic fallback until the preview loads and when it fails', async () => {
    await render();
    const first = cards()[0];
    // Before the image reports a load, the fallback is shown and the image is hidden.
    expect(first.querySelector('.product-documents__sheet')).not.toBeNull();
    const image = first.querySelector<HTMLImageElement>('img')!;
    expect(image.style.visibility).toBe('hidden');

    image.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(first.querySelector('.product-documents__sheet')).toBeNull();
    expect(image.style.visibility).toBe('visible');

    const second = cards()[1];
    second.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(second.querySelector('.product-documents__sheet')).not.toBeNull();
    expect(second.querySelector('img')!.style.visibility).toBe('hidden');
  });

  it('opens the real document in a new tab when a valid href is provided', async () => {
    await render();
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('a'));
    expect(links).toHaveLength(dataset.length);
    links.forEach((link, index) => {
      expect(link.getAttribute('href')).toBe(dataset[index].href);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.getAttribute('aria-label')).toBe(`Abrir ${dataset[index].fileName}`);
    });
  });

  it('does not render invalid links when no real file is supplied', async () => {
    await render([
      { id: 'missing', title: 'Ficha sin archivo', fileName: 'ficha.pdf', format: 'PDF' },
      { id: 'hash', title: 'Hash', fileName: 'hash.pdf', format: 'PDF', href: '#' },
      {
        id: 'script',
        title: 'Script',
        fileName: 'script.pdf',
        format: 'PDF',
        href: 'javascript:void(0)',
      },
    ]);

    expect(element.querySelectorAll('a')).toHaveLength(0);
    expect(cards()).toHaveLength(3);
    expect(
      cards().map((card) => card.querySelector('.product-documents__name')?.textContent),
    ).toEqual(['ficha.pdf', 'hash.pdf', 'script.pdf']);
  });

  describe('navigation controls', () => {
    function mockScroll(
      metrics: { scrollWidth: number; clientWidth: number; scrollLeft: number },
      scrollBy = vi.fn(),
    ) {
      const viewport = element.querySelector<HTMLElement>('.product-documents__viewport')!;
      Object.defineProperty(viewport, 'scrollWidth', {
        configurable: true,
        value: metrics.scrollWidth,
      });
      Object.defineProperty(viewport, 'clientWidth', {
        configurable: true,
        value: metrics.clientWidth,
      });
      viewport.scrollLeft = metrics.scrollLeft;
      viewport.scrollBy = scrollBy;
      viewport.dispatchEvent(new Event('scroll'));
      return viewport;
    }

    const previous = () =>
      element.querySelector<HTMLButtonElement>('button[aria-label="Documentos anteriores"]')!;
    const next = () =>
      element.querySelector<HTMLButtonElement>('button[aria-label="Documentos siguientes"]')!;

    it('hides the controls when every document fits', async () => {
      await render();
      mockScroll({ scrollWidth: 800, clientWidth: 800, scrollLeft: 0 });
      await fixture.whenStable();
      expect(previous().hidden).toBe(true);
      expect(next().hidden).toBe(true);
      expect(element.querySelector('.product-documents__viewport')?.hasAttribute('tabindex')).toBe(
        false,
      );
    });

    it('enables only the useful direction and scrolls one card at a time', async () => {
      await render();
      const scrollBy = vi.fn();
      const viewport = mockScroll({ scrollWidth: 1600, clientWidth: 800, scrollLeft: 0 }, scrollBy);
      await fixture.whenStable();

      expect(previous().hidden).toBe(true);
      expect(previous().disabled).toBe(true);
      expect(next().disabled).toBe(false);
      expect(next().hidden).toBe(false);
      expect(viewport.getAttribute('tabindex')).toBe('0');

      next().click();
      expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: expect.any(Number) }));

      mockScroll({ scrollWidth: 1600, clientWidth: 800, scrollLeft: 800 }, scrollBy);
      await fixture.whenStable();
      expect(previous().disabled).toBe(false);
      expect(previous().hidden).toBe(false);
      expect(next().disabled).toBe(true);
      expect(next().hidden).toBe(true);

      previous().click();
      const [lastCall] = scrollBy.mock.calls.slice(-1);
      expect(lastCall[0].left).toBeLessThanOrEqual(0);
    });
  });
});
