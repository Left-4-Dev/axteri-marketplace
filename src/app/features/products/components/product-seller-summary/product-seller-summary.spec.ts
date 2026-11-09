import { TestBed } from '@angular/core/testing';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductSellerSummary } from './product-seller-summary';

describe('ProductSellerSummary', () => {
  const setup = async () => {
    await TestBed.configureTestingModule({ imports: [ProductSellerSummary] }).compileComponents();
    const fixture = TestBed.createComponent(ProductSellerSummary);
    fixture.componentRef.setInput('seller', W22_PRODUCT_DETAIL.seller);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  };

  it('renders seller identity and commercial metadata', async () => {
    const { element } = await setup();
    expect(element.textContent).toContain('LDF Projects');
    expect(element.textContent).toContain('+200 productos');
    expect(element.textContent).toContain('+12 años');
    expect(element.querySelector('[aria-label="Proveedor verificado"]')).not.toBeNull();
  });

  it('uses a neutral initial while the actual logo is missing', async () => {
    const { fixture, element } = await setup();
    const image = element.querySelector('img')!;
    expect(image.getAttribute('src')).toBe(W22_PRODUCT_DETAIL.seller!.logo!.src);
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.style.visibility).toBe('hidden');
    expect(element.querySelector('.seller-summary__avatar span')?.textContent).toBe('L');
    image.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(element.querySelector('.seller-summary__avatar span')).toBeNull();
  });

  it('emits profile intent without a fictional navigation or dialog', async () => {
    const { fixture, element } = await setup();
    const emit = vi.spyOn(fixture.componentInstance.profileRequest, 'emit');
    const button = element.querySelector('button')!;
    expect(button.textContent).toContain('Perfil del proveedor');
    button.click();
    expect(emit).toHaveBeenCalledOnce();
    expect(element.querySelector('a, dialog')).toBeNull();
  });
});
