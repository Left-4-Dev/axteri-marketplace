import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductSummary } from './product-summary';

describe('ProductSummary', () => {
  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSummary],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductSummary);
    fixture.componentRef.setInput('detail', W22_PRODUCT_DETAIL);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  };

  it('prioritizes four overview metrics while retaining other model data', async () => {
    const { element } = await setup();
    expect([...element.querySelectorAll('dt')].map((item) => item.textContent)).toEqual([
      'Potencia',
      'Velocidad',
      'Torque nominal',
      'Rendimiento',
    ]);
    expect(W22_PRODUCT_DETAIL.highlights.map((item) => item.label)).toContain('Tensión nominal');
    expect(W22_PRODUCT_DETAIL.highlights.map((item) => item.label)).toContain('Protección');
    expect(element.querySelectorAll('.product-summary__applications li')).toHaveLength(4);
    expect(element.querySelector<HTMLAnchorElement>('a')!.hash).toBe('#descripcion');
  });

  it('retains origin text and an emoji fallback when the flag is absent', async () => {
    const { fixture, element } = await setup();
    element.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(element.querySelector('.product-summary__badges')?.textContent).toContain('Brasil');
    expect(element.querySelector('.product-summary__flag')?.textContent).toContain('🇧🇷');
  });
});
