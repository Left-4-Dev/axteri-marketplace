import { ComponentFixture, TestBed } from '@angular/core/testing';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductPurchasePanel } from './product-purchase-panel';

describe('ProductPurchasePanel', () => {
  let fixture: ComponentFixture<ProductPurchasePanel>;
  let element: HTMLElement;
  const quantity = () => element.querySelector<HTMLInputElement>('#product-quantity')!;
  const decrease = () =>
    element.querySelector<HTMLButtonElement>('[aria-label="Disminuir cantidad"]')!;
  const increase = () =>
    element.querySelector<HTMLButtonElement>('[aria-label="Aumentar cantidad"]')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductPurchasePanel] }).compileComponents();
    fixture = TestBed.createComponent(ProductPurchasePanel);
    fixture.componentRef.setInput('detail', W22_PRODUCT_DETAIL);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  it('keeps quantity at a minimum of one', async () => {
    expect(quantity().value).toBe('1');
    expect(decrease().disabled).toBe(true);
    decrease().click();
    await fixture.whenStable();
    expect(quantity().value).toBe('1');
    increase().click();
    await fixture.whenStable();
    expect(quantity().value).toBe('2');
    decrease().click();
    await fixture.whenStable();
    expect(quantity().value).toBe('1');
  });

  it.each(['-5', '0', '', '1.9'])(
    'normalizes invalid quantity %s to a positive integer',
    async (value) => {
      quantity().value = value;
      quantity().dispatchEvent(new Event('change'));
      await fixture.whenStable();
      expect(quantity().value).toBe('1');
    },
  );

  it('emits contact and quote intents with the chosen quantity', async () => {
    const emit = vi.spyOn(fixture.componentInstance.purchaseIntent, 'emit');
    increase().click();
    await fixture.whenStable();
    const buttons = element.querySelectorAll<HTMLButtonElement>('.purchase-panel__actions button');
    buttons[0].click();
    expect(emit).toHaveBeenCalledWith({ kind: 'contact', quantity: 2 });
    buttons[1].click();
    expect(emit).toHaveBeenCalledWith({ kind: 'quote', quantity: 2 });
  });

  it('renders the previous price from detail purchase information', () => {
    expect(element.querySelector('.purchase-panel__price')?.textContent).toContain('S/ 4,000.00');
    expect(element.querySelector('.purchase-panel__reference')?.textContent).toContain('4,500.00');
    expect(element.querySelector('.purchase-panel__reference s')).not.toBeNull();
    expect(element.querySelectorAll('.purchase-panel__actions button')).toHaveLength(2);
  });

  it('omits a previous price when it is not higher than the current price', async () => {
    fixture.componentRef.setInput('detail', {
      ...W22_PRODUCT_DETAIL,
      purchase: { ...W22_PRODUCT_DETAIL.purchase, previousAmount: 3900 },
    });
    await fixture.whenStable();
    expect(element.querySelector('.purchase-panel__reference')).toBeNull();
  });

  it('keeps the complete address accessible and emits a change request without changing quantity', async () => {
    const emit = vi.spyOn(fixture.componentInstance.shippingAddressChangeRequest, 'emit');
    const address = element.querySelector('.purchase-panel__address')!;
    expect(address.textContent).toContain(W22_PRODUCT_DETAIL.purchase.destination);
    expect(address.getAttribute('title')).toBe(W22_PRODUCT_DETAIL.purchase.destination);
    expect(element.querySelector('.purchase-panel__delivery')?.textContent).toContain(
      W22_PRODUCT_DETAIL.purchase.deliveryEstimate,
    );
    const change = element.querySelector<HTMLButtonElement>('.purchase-panel__change-address')!;
    expect(change.type).toBe('button');
    expect(change.textContent?.trim()).toBe('Cambiar');
    expect(change.getAttribute('aria-label')).toBe('Cambiar dirección de envío');
    increase().click();
    await fixture.whenStable();
    change.click();
    expect(emit).toHaveBeenCalledOnce();
    expect(quantity().value).toBe('2');
    expect(element.querySelector('dialog')).toBeNull();
  });
});
