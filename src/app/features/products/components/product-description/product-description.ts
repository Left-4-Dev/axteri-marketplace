import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { ProductDescriptionContent } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-description',
  imports: [Button],
  templateUrl: './product-description.html',
  styleUrl: './product-description.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDescription {
  readonly description = input.required<ProductDescriptionContent>();
  readonly consultationRequest = output<void>();

  // Estado local vinculado al input para limpiar el aviso si cambia la ficha activa.
  protected readonly consultationMessage = linkedSignal<ProductDescriptionContent, string>({
    source: this.description,
    computation: () => '',
  });

  protected onConsult(): void {
    this.consultationMessage.set(
      'El asistente virtual estará disponible próximamente. No se ha iniciado ninguna consulta.',
    );
    this.consultationRequest.emit();
  }
}
