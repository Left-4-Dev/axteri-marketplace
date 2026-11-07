import { ComponentFixture, TestBed } from '@angular/core/testing';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductSpecificationSheet } from '../../models/product-detail.model';
import { ProductSpecifications } from './product-specifications';

describe('ProductSpecifications', () => {
  let fixture: ComponentFixture<ProductSpecifications>;
  let element: HTMLElement;
  const sheet = W22_PRODUCT_DETAIL.specifications;
  const groupButtons = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('.product-specifications__group'));
  const rows = () =>
    Array.from(element.querySelectorAll('.product-specifications__row')).map((row) => ({
      label: row.querySelector('dt')?.textContent?.trim(),
      value: row.querySelector('dd')?.textContent?.replace(/\s+/g, ' ').trim(),
    }));

  async function render(value: ProductSpecificationSheet = sheet): Promise<void> {
    fixture = TestBed.createComponent(ProductSpecifications);
    fixture.componentRef.setInput('specifications', value);
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductSpecifications] }).compileComponents();
  });

  it('renders the section heading', async () => {
    await render();
    expect(element.querySelector('h2')?.textContent).toBe('Características');
  });

  it('renders every group as a button with its letter, label and count', async () => {
    await render();
    const buttons = groupButtons();
    expect(buttons).toHaveLength(sheet.groups.length);
    buttons.forEach((button, index) => {
      const group = sheet.groups[index];
      expect(button.type).toBe('button');
      expect(button.textContent).toContain(`${String.fromCharCode(65 + index)}. ${group.label}`);
      expect(button.textContent).toContain(String(group.specifications.length));
    });
  });

  it('selects the first group by default and exposes its state', async () => {
    await render();
    const [first, ...others] = groupButtons();
    expect(first.getAttribute('aria-current')).toBe('true');
    others.forEach((button) => expect(button.hasAttribute('aria-current')).toBe(false));
    expect(element.querySelector('h3')?.textContent).toContain(sheet.groups[0].title);
  });

  it('renders the specifications of the initial group from the input', async () => {
    await render();
    expect(rows()).toHaveLength(sheet.groups[0].specifications.length);
    expect(rows()[0]).toEqual({ label: 'Potencia nominal', value: '3 kW (4 HP)' });
    expect(element.querySelectorAll('dl > div > dt')).toHaveLength(rows().length);
  });

  it('updates only the panel when another group is selected', async () => {
    await render();
    const list = element.querySelector('.product-specifications__groups');
    const buttons = groupButtons();
    for (const [index, group] of sheet.groups.entries()) {
      buttons[index].click();
      await fixture.whenStable();
      expect(groupButtons()[index].getAttribute('aria-current')).toBe('true');
      expect(element.querySelectorAll('[aria-current="true"]')).toHaveLength(1);
      expect(element.querySelector('h3')?.textContent).toContain(group.title);
      expect(rows().map((row) => row.label)).toEqual(group.specifications.map((s) => s.label));
    }
    expect(element.querySelector('.product-specifications__groups')).toBe(list);
    expect(groupButtons()[2]).toBe(buttons[2]);
  });

  it('links every button to the panel it controls', async () => {
    await render();
    groupButtons().forEach((button) => {
      const panel = element.querySelector(`#${button.getAttribute('aria-controls')}`);
      expect(panel).not.toBeNull();
      expect(panel?.querySelector('dl')).not.toBeNull();
    });
  });

  it('renders any group supplied as data without template changes', async () => {
    await render({
      groups: [
        { id: 'a', label: 'Uno', title: 'Grupo uno', specifications: [{ label: 'X', value: '1' }] },
        {
          id: 'b',
          label: 'Dos',
          title: 'Grupo dos',
          specifications: [
            { label: 'Y', value: '2', detail: 'dos' },
            { label: 'Z', value: '3' },
          ],
        },
        {
          id: 'new-group',
          label: 'Nuevo grupo',
          title: 'Grupo nuevo',
          specifications: [{ label: 'W', value: '4' }],
        },
      ],
    });
    expect(groupButtons()).toHaveLength(3);
    expect(element.querySelector('.product-specifications__verification')).toBeNull();
    groupButtons()[1].click();
    await fixture.whenStable();
    expect(rows()).toEqual([
      { label: 'Y', value: '2 (dos)' },
      { label: 'Z', value: '3' },
    ]);
    groupButtons()[2].click();
    await fixture.whenStable();
    expect(element.querySelector('h3')?.textContent).toContain('C. Grupo nuevo');
  });

  it('shows the mock verification note when it is provided', async () => {
    await render();
    expect(element.querySelector('.product-specifications__verification')?.textContent).toContain(
      'Última verificación: 12 ene 2026 LDF Projects',
    );
  });

  it('resets deterministically to the first group when a new specification sheet is supplied', async () => {
    await render();
    groupButtons()[1].click();
    await fixture.whenStable();
    expect(groupButtons()[1].getAttribute('aria-current')).toBe('true');

    fixture.componentRef.setInput('specifications', {
      groups: [
        {
          id: 'general',
          label: 'Generales',
          title: 'Características generales',
          specifications: [{ label: 'Modelo', value: 'Serie X' }],
        },
        {
          id: 'mechanical',
          label: 'Mecánicas',
          title: 'Características mecánicas',
          specifications: [{ label: 'Peso', value: '12 kg' }],
        },
      ],
    });
    await fixture.whenStable();

    expect(groupButtons()[0].getAttribute('aria-current')).toBe('true');
    expect(groupButtons()[1].hasAttribute('aria-current')).toBe(false);
    expect(element.querySelector('h3')?.textContent).toContain('A. Características generales');
  });
});
