import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { ProductSpecificationSheet } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-specifications',
  templateUrl: './product-specifications.html',
  styleUrl: './product-specifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSpecifications {
  readonly specifications = input.required<ProductSpecificationSheet>();
  // Estado local vinculado al input: inicia y se reinicia en el primer id estable de cada ficha.
  private readonly selectedGroupId = linkedSignal<ProductSpecificationSheet, string | undefined>({
    source: this.specifications,
    computation: (sheet) => sheet.groups[0]?.id,
  });

  // La letra del grupo se deriva del orden de los datos, para añadir grupos sin tocar la plantilla.
  protected readonly groups = computed(() =>
    this.specifications().groups.map((group, index) => ({
      ...group,
      code: String.fromCharCode(65 + index),
    })),
  );
  // Un id inexistente resuelve siempre al primer grupo disponible.
  protected readonly selectedGroup = computed(() => {
    const groups = this.groups();
    return groups.find((group) => group.id === this.selectedGroupId()) ?? groups[0];
  });

  protected selectGroup(id: string): void {
    this.selectedGroupId.set(id);
  }
}
