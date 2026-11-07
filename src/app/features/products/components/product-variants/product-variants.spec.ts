import { ComponentFixture, TestBed } from '@angular/core/testing';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductImage, ProductVariant } from '../../models/product-detail.model';
import { ProductVariants } from './product-variants';

describe('ProductVariants', () => {
  let fixture: ComponentFixture<ProductVariants>;
  let element: HTMLElement;
  const dataset = W22_PRODUCT_DETAIL.variants;
  const fallbackImage: ProductImage = W22_PRODUCT_DETAIL.images[0];

  const chipButtons = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('.product-variants__chip'));
  const chipByText = (label: string) =>
    chipButtons().find((btn) => btn.textContent?.trim() === label)!;
  const tableRows = () =>
    Array.from(element.querySelectorAll<HTMLTableRowElement>('tbody .product-variants__row'));
  const selectedRows = () =>
    Array.from(
      element.querySelectorAll<HTMLTableRowElement>('tbody .product-variants__row--selected'),
    );

  async function render(
    variants: readonly ProductVariant[] = dataset,
    initialSku?: string,
  ): Promise<void> {
    fixture = TestBed.createComponent(ProductVariants);
    fixture.componentRef.setInput('variants', variants);
    fixture.componentRef.setInput('fallbackImage', fallbackImage);
    if (initialSku !== undefined) {
      fixture.componentRef.setInput('initialSku', initialSku);
    }
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductVariants] }).compileComponents();
  });

  it('renders the section heading Variaciones', async () => {
    await render();
    expect(element.querySelector('h2')?.textContent).toBe('Variaciones');
  });

  it('derives filter chips from the variants dataset without active filters initially', async () => {
    await render();
    const groups = element.querySelectorAll('.product-variants__filter-group');
    expect(groups).toHaveLength(2);

    const chips = chipButtons();
    expect(chips.map((btn) => btn.textContent?.trim())).toEqual([
      '2 Polos — ~2900 rpm',
      '4 Polos — ~1450 rpm',
      '6 Polos — ~960 rpm',
      '0.75 kW',
      '1.5 kW',
      '3 kW',
      '5.5 kW',
      '11 kW',
    ]);
    chips.forEach((btn) => {
      expect(btn.type).toBe('button');
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });
  });

  it('renders semantic table headers and all variants initially with correct data', async () => {
    await render();
    const headers = Array.from(element.querySelectorAll('thead th[scope="col"]')).map((th) =>
      th.textContent?.trim(),
    );
    expect(headers).toEqual([
      'Potencia',
      'Marco',
      'Vel. (rpm)',
      'Torque (N·m)',
      'Corriente',
      'Rend. (%)',
      'FP',
      'Peso (kg)',
      'Categoría',
    ]);

    const rows = tableRows();
    expect(rows).toHaveLength(dataset.length);
    rows.forEach((row, index) => {
      const variant = dataset[index];
      expect(row.querySelector('th[scope="row"]')?.textContent?.trim()).toBe(
        variant.attributes.power,
      );
      const cells = Array.from(row.querySelectorAll('td')).map((td) => td.textContent?.trim());
      expect(cells).toEqual([
        variant.attributes.frame,
        variant.attributes.speed,
        variant.attributes.torque,
        variant.attributes.current,
        variant.attributes.efficiency,
        variant.attributes.powerFactor,
        variant.attributes.weight,
        variant.category,
      ]);
    });
  });

  it('tracks rows by stable variant id when the dataset order changes', async () => {
    await render();
    const firstRowBefore = tableRows()[0];

    fixture.componentRef.setInput('variants', [...dataset].reverse());
    await fixture.whenStable();

    const rowsAfter = tableRows();
    expect(rowsAfter[rowsAfter.length - 1]).toBe(firstRowBefore);
  });

  it('selects the first variant deterministically by default, or initialSku when matched', async () => {
    await render(dataset);
    expect(selectedRows()).toHaveLength(1);
    expect(element.querySelector('.product-variants__sku')?.textContent).toBe(dataset[0].sku);

    await render(dataset, W22_PRODUCT_DETAIL.sku);
    expect(selectedRows()).toHaveLength(1);
    expect(element.querySelector('.product-variants__sku')?.textContent).toBe(
      W22_PRODUCT_DETAIL.sku,
    );
    expect(element.querySelector('.product-variants__price')?.textContent).toContain('S/ 4,000.00');
  });

  it('updates the summary panel when another variant row is selected', async () => {
    await render();
    const targetVariant = dataset[6];
    tableRows()[6].querySelector<HTMLButtonElement>('.product-variants__row-trigger')!.click();
    await fixture.whenStable();

    expect(selectedRows()).toHaveLength(1);
    expect(
      tableRows()[6].querySelector('.product-variants__row-trigger')?.getAttribute('aria-pressed'),
    ).toBe('true');
    expect(element.querySelector('.product-variants__sku')?.textContent).toBe(targetVariant.sku);
    expect(element.querySelector('.product-variants__price')?.textContent).toContain('S/ 9,400.00');
    expect(element.querySelector('.product-variants__specs')?.textContent).toContain('160 M');
    expect(element.querySelector('.product-variants__availability')?.textContent).toContain(
      targetVariant.deliveryEstimate,
    );
  });

  it('filters visible rows and preserves selection while still valid', async () => {
    await render(dataset, W22_PRODUCT_DETAIL.sku);
    expect(element.querySelector('.product-variants__sku')?.textContent).toBe(
      'W22-3KW-380-B3-IP55',
    );

    const sixPolesChip = chipByText('6 Polos — ~960 rpm');
    sixPolesChip.click();
    await fixture.whenStable();

    expect(sixPolesChip.getAttribute('aria-pressed')).toBe('true');
    expect(tableRows()).toHaveLength(4);
    expect(element.querySelector('.product-variants__sku')?.textContent).toBe(
      'W22-3KW-380-B3-IP55',
    );
  });

  it('switches selection deterministically to the first visible variant when excluded by filters', async () => {
    await render(dataset, W22_PRODUCT_DETAIL.sku);
    expect(element.querySelector('.product-variants__sku')?.textContent).toBe(
      'W22-3KW-380-B3-IP55',
    );

    chipByText('4 Polos — ~1450 rpm').click();
    await fixture.whenStable();

    expect(tableRows()).toHaveLength(2);
    expect(selectedRows()).toHaveLength(1);
    expect(element.querySelector('.product-variants__sku')?.textContent).toBe(
      'W22-3KW-4P-380-B3-IP55',
    );
    expect(element.querySelector('.product-variants__price')?.textContent).toContain('S/ 3,650.00');
  });

  it('displays an accessible empty state and resets filters when no combination matches', async () => {
    await render(dataset, W22_PRODUCT_DETAIL.sku);

    chipByText('2 Polos — ~2900 rpm').click();
    chipByText('11 kW').click();
    await fixture.whenStable();

    expect(element.querySelector('table')).toBeNull();
    const empty = element.querySelector('.product-variants__empty')!;
    expect(empty).not.toBeNull();
    expect(empty.textContent).toContain('No encontramos variaciones con esta combinación.');
    expect(element.querySelector('.product-variants__sku')).toBeNull();

    empty.querySelector<HTMLButtonElement>('app-button button')!.click();
    await fixture.whenStable();

    expect(tableRows()).toHaveLength(dataset.length);
    expect(chipButtons().every((btn) => btn.getAttribute('aria-pressed') === 'false')).toBe(true);
    expect(element.querySelector('.product-variants__sku')?.textContent).toBe(
      W22_PRODUCT_DETAIL.sku,
    );
  });

  it('emits variantQuoteRequest and announces honest status on CTA click', async () => {
    await render(dataset, W22_PRODUCT_DETAIL.sku);
    const spy = vi.fn();
    fixture.componentInstance.variantQuoteRequest.subscribe(spy);

    const ctaButton = element.querySelector<HTMLButtonElement>(
      '.product-variants__cta app-button button',
    )!;
    ctaButton.click();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(dataset[2]);
    expect(element.querySelector('.product-variants__status')?.textContent).toContain(
      'estará disponible próximamente',
    );
  });

  it('resets filters, selection and status deterministically when the product dataset changes', async () => {
    await render(dataset, W22_PRODUCT_DETAIL.sku);
    chipByText('4 Polos — ~1450 rpm').click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.product-variants__cta app-button button')!.click();
    await fixture.whenStable();

    expect(element.querySelector('.product-variants__status')?.textContent).not.toBe('');

    const replacementDataset: readonly ProductVariant[] = [
      {
        id: 'other-motor-75kw',
        sku: 'W22-75KW-4P-440-B3-IP55',
        category: 'Industrial',
        attributes: {
          polesGroup: '4 Polos — ~1450 rpm',
          poles: '4 polos',
          power: '75 kW',
          powerDetail: '100 HP',
          frame: '250 S/M',
          speed: '1480 rpm',
          torque: '484 N·m',
          current: '124 A',
          efficiency: '95.0 %',
          powerFactor: '0.86',
          weight: '460 kg',
          voltage: '440 V Δ',
          mounting: 'B3',
          protection: 'IP55',
        },
        price: { kind: 'quote' },
        stock: 3,
        deliveryEstimate: '20–25 días hábiles',
      },
    ];

    fixture.componentRef.setInput('initialSku', undefined);
    fixture.componentRef.setInput('variants', replacementDataset);
    await fixture.whenStable();

    expect(chipButtons().every((btn) => btn.getAttribute('aria-pressed') === 'false')).toBe(true);
    expect(tableRows()).toHaveLength(1);
    expect(element.querySelector('.product-variants__sku')?.textContent).toBe(
      'W22-75KW-4P-440-B3-IP55',
    );
    expect(element.querySelector('.product-variants__price')?.textContent).toBe('Por cotizar');
    expect(element.querySelector('.product-variants__status')?.textContent).toBe('');
  });
});
