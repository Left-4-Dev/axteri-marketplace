import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { ProductImage, ProductVariant } from '../../models/product-detail.model';

export type VariantFilterKey = 'polesGroup' | 'power';

export interface VariantFilterState {
  readonly polesGroup: string | null;
  readonly power: string | null;
}

export interface VariantFilterGroup {
  readonly key: VariantFilterKey;
  readonly label: string;
  readonly options: readonly string[];
}

function sortTechnicalValues(values: readonly string[]): string[] {
  return [...values].sort((a, b) => {
    const numA = Number.parseFloat(a);
    const numB = Number.parseFloat(b);
    if (Number.isFinite(numA) && Number.isFinite(numB)) {
      return numA - numB;
    }
    return 0;
  });
}

@Component({
  selector: 'app-product-variants',
  imports: [Button, CurrencyPipe],
  templateUrl: './product-variants.html',
  styleUrl: './product-variants.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariants {
  readonly variants = input.required<readonly ProductVariant[]>();
  readonly initialSku = input<string>();
  readonly fallbackImage = input<ProductImage>();
  readonly variantQuoteRequest = output<ProductVariant>();

  // Los filtros se reinician de forma determinista si cambia el dataset del producto activo.
  protected readonly selectedFilters = linkedSignal<readonly ProductVariant[], VariantFilterState>({
    source: this.variants,
    computation: () => ({ polesGroup: null, power: null }),
  });

  // Opciones derivadas dinámicamente de las variantes recibidas, sin duplicar catálogos fijos.
  protected readonly filterGroups = computed<readonly VariantFilterGroup[]>(() => {
    const items = this.variants();
    const polesOptions = sortTechnicalValues(
      Array.from(new Set(items.map((item) => item.attributes.polesGroup))),
    );
    const powerOptions = sortTechnicalValues(
      Array.from(new Set(items.map((item) => item.attributes.power))),
    );
    return [
      { key: 'polesGroup' as const, label: 'N° de polos', options: polesOptions },
      { key: 'power' as const, label: 'Potencia', options: powerOptions },
    ].filter((group) => group.options.length > 0);
  });

  protected readonly hasActiveFilters = computed(() => {
    const filters = this.selectedFilters();
    return filters.polesGroup !== null || filters.power !== null;
  });

  protected readonly filteredVariants = computed(() => {
    const filters = this.selectedFilters();
    return this.variants().filter((variant) => {
      const matchesPoles =
        filters.polesGroup === null || variant.attributes.polesGroup === filters.polesGroup;
      const matchesPower = filters.power === null || variant.attributes.power === filters.power;
      return matchesPoles && matchesPower;
    });
  });

  private readonly selectionSource = computed(() => ({
    variants: this.variants(),
    initialSku: this.initialSku(),
    filtered: this.filteredVariants(),
  }));

  // Mantiene una selección consistente frente a filtros, estado vacío y cambios de producto.
  protected readonly selectedVariantId = linkedSignal<
    {
      readonly variants: readonly ProductVariant[];
      readonly initialSku: string | undefined;
      readonly filtered: readonly ProductVariant[];
    },
    string | null
  >({
    source: this.selectionSource,
    computation: (next, previous) => {
      if (next.filtered.length === 0) {
        return null;
      }

      const datasetChanged = !previous || previous.source.variants !== next.variants;
      if (datasetChanged) {
        const matched = next.initialSku
          ? next.filtered.find((item) => item.sku === next.initialSku)
          : undefined;
        return (matched ?? next.filtered[0]).id;
      }

      const currentId = previous.value;
      if (currentId && next.filtered.some((item) => item.id === currentId)) {
        return currentId;
      }

      if (currentId === null && next.initialSku) {
        const matched = next.filtered.find((item) => item.sku === next.initialSku);
        if (matched) {
          return matched.id;
        }
      }

      return next.filtered[0].id;
    },
  });

  protected readonly selectedVariant = computed(() => {
    const id = this.selectedVariantId();
    if (!id) {
      return null;
    }
    return this.filteredVariants().find((item) => item.id === id) ?? null;
  });

  private readonly actionResetSource = computed(() => ({
    variants: this.variants(),
    selectedId: this.selectedVariantId(),
  }));

  protected readonly actionMessage = linkedSignal<
    { readonly variants: readonly ProductVariant[]; readonly selectedId: string | null },
    string
  >({
    source: this.actionResetSource,
    computation: () => '',
  });

  protected toggleFilter(key: VariantFilterKey, option: string): void {
    this.selectedFilters.update((current) => ({
      ...current,
      [key]: current[key] === option ? null : option,
    }));
  }

  protected resetFilters(): void {
    this.selectedFilters.set({ polesGroup: null, power: null });
  }

  protected selectVariant(id: string): void {
    if (this.filteredVariants().some((item) => item.id === id)) {
      this.selectedVariantId.set(id);
    }
  }

  protected onRequestQuote(variant: ProductVariant): void {
    this.actionMessage.set(
      `La cotización para la variante ${variant.sku} estará disponible próximamente. No se ha enviado ninguna solicitud.`,
    );
    this.variantQuoteRequest.emit(variant);
  }
}
