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
});
