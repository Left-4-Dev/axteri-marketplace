import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFiltersState } from '../../models/product-listing.model';
import { ProductFilters } from './product-filters';

describe('ProductFilters', () => {
  let fixture: ComponentFixture<ProductFilters>;
  let component: ProductFilters;
  let element: HTMLElement;
  let emittedStates: ProductFiltersState[];

  const applyButton = () =>
    element.querySelector<HTMLButtonElement>('button.product-filters__apply')!;
  const clearButton = () =>
    element.querySelector<HTMLButtonElement>('button.product-filters__clear')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFilters);
    component = fixture.componentInstance;
    emittedStates = [];
    component.filtersChange.subscribe((state) => emittedStates.push(state));
    await fixture.whenStable();
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the 7 base filter groups and displays the 8th (Filtros seleccionados) only after applying filters', async () => {
    const legends = Array.from(
      element.querySelectorAll<HTMLLegendElement>('legend.product-filters__title'),
      (el) => el.textContent?.trim(),
    );

    expect(legends).toEqual([
      'Organizar por',
      'Verificación de proveedor',
      'Rango de precio',
      'Capacidad de compra',
      'Reseña del producto',
      'Marcas',
      'Origen del producto',
    ]);
    expect(element.querySelector('#selected-filters-heading')).toBeNull();
    expect(element.querySelectorAll('.price-range__track')).toHaveLength(1);
    expect(element.querySelectorAll('.price-range__input')).toHaveLength(2);

    const schneiderCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Schneider"]',
    )!;
    schneiderCheckbox.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('#selected-filters-heading')).toBeNull();
    expect(emittedStates).toHaveLength(0);

    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('#selected-filters-heading')?.textContent?.trim()).toBe(
      'Filtros seleccionados',
    );
    expect(element.querySelectorAll('.product-filters__group')).toHaveLength(8);
  });

  it('does not emit filtersChange immediately when changing checkboxes, radios, or price range until APLICAR FILTROS is clicked', async () => {
    const verifiedCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="verified"]',
    )!;
    const priceAscRadio = element.querySelector<HTMLInputElement>(
      'input[type="radio"][name="product-sort"][value="price-asc"]',
    )!;
    const maxRangeInput = element.querySelector<HTMLInputElement>(
      'input[type="range"][aria-label="Precio máximo"]',
    )!;

    verifiedCheckbox.click();
    priceAscRadio.click();
    priceAscRadio.dispatchEvent(new Event('change'));
    maxRangeInput.value = '5000';
    maxRangeInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emittedStates).toHaveLength(0);

    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emittedStates).toHaveLength(1);
    expect(emittedStates[0]).toEqual({
      sortBy: 'price-asc',
      supplierVerification: ['verified'],
      priceRange: { min: 0, max: 5000 },
      purchaseCapacity: [],
      minRating: null,
      brands: [],
      origins: [],
    });
  });

  it('restores the applied state when discardDraft is called (cancel/close without applying)', async () => {
    const schneiderCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Schneider"]',
    )!;
    schneiderCheckbox.click();
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(schneiderCheckbox.checked).toBe(true);
    expect(emittedStates).toHaveLength(1);

    const siemensCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Siemens"]',
    )!;
    schneiderCheckbox.click();
    siemensCheckbox.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(schneiderCheckbox.checked).toBe(false);
    expect(siemensCheckbox.checked).toBe(true);
    expect(emittedStates).toHaveLength(1);

    component.discardDraft();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(schneiderCheckbox.checked).toBe(true);
    expect(siemensCheckbox.checked).toBe(false);
    expect(emittedStates).toHaveLength(1);
  });

  it('clamps price min so it never exceeds max, and price max so it never drops below min', async () => {
    const minRangeInput = element.querySelector<HTMLInputElement>(
      'input[type="range"][aria-label="Precio mínimo"]',
    )!;
    const maxRangeInput = element.querySelector<HTMLInputElement>(
      'input[type="range"][aria-label="Precio máximo"]',
    )!;

    maxRangeInput.value = '4000';
    maxRangeInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    minRangeInput.value = '9000';
    minRangeInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(minRangeInput.value).toBe('4000');

    maxRangeInput.value = '1500';
    maxRangeInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(maxRangeInput.value).toBe('4000');

    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emittedStates.at(-1)?.priceRange).toEqual({ min: 4000, max: 4000 });
  });

  it('clears the draft when clicking Limpiar without emitting until APLICAR FILTROS is clicked', async () => {
    const brandCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Schneider"]',
    )!;
    const fourStarBtn = element.querySelector<HTMLButtonElement>(
      'button[aria-label="4 estrellas o más"]',
    )!;

    brandCheckbox.click();
    fourStarBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(brandCheckbox.checked).toBe(true);
    expect(fourStarBtn.getAttribute('aria-pressed')).toBe('true');

    clearButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(brandCheckbox.checked).toBe(false);
    expect(fourStarBtn.getAttribute('aria-pressed')).toBe('false');
    expect(emittedStates).toHaveLength(0);

    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emittedStates).toHaveLength(1);
    expect(emittedStates[0].brands).toEqual([]);
    expect(emittedStates[0].minRating).toBeNull();
  });

  it('removes an applied chip immediately and synchronizes both applied and draft states', async () => {
    const brandCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Schneider"]',
    )!;
    const originCheckbox = element.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="Alemania"]',
    )!;

    brandCheckbox.click();
    originCheckbox.click();
    applyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    let chips = Array.from(
      element.querySelectorAll<HTMLButtonElement>('button.product-filters__chip'),
    );
    expect(chips).toHaveLength(2);

    chips[0].click();
    await fixture.whenStable();
    fixture.detectChanges();

    chips = Array.from(element.querySelectorAll<HTMLButtonElement>('button.product-filters__chip'));
    expect(chips).toHaveLength(1);
    expect(chips[0].getAttribute('aria-label')).toBe('Quitar filtro Alemania');
    expect(brandCheckbox.checked).toBe(false);
    expect(emittedStates.at(-1)?.brands).toEqual([]);
    expect(emittedStates.at(-1)?.origins).toEqual(['Alemania']);
  });

  it('filters the visible brand list on search without emitting filtersChange', async () => {
    const brandSearch = element.querySelector<HTMLInputElement>(
      'input[type="search"][aria-label="Buscar marca"]',
    )!;

    brandSearch.value = 'schnei';
    brandSearch.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    const brandLabels = Array.from(
      element.querySelectorAll<HTMLElement>('.product-filters__option--brand span'),
      (el) => el.textContent?.trim(),
    );
    expect(brandLabels).toEqual(['Schneider']);
    expect(emittedStates).toHaveLength(0);
  });

  it('filters the visible origin list on search without emitting filtersChange', async () => {
    const originSearch = element.querySelector<HTMLInputElement>(
      'input[type="search"][aria-label="Buscar origen"]',
    )!;

    originSearch.value = 'jap';
    originSearch.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    const originCheckboxes = Array.from(
      element.querySelectorAll<HTMLInputElement>('fieldset:last-of-type input[type="checkbox"]'),
      (el) => el.value,
    );
    expect(originCheckboxes).toEqual(['Japón']);
    expect(emittedStates).toHaveLength(0);
  });
});
