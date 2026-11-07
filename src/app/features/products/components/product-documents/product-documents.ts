import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProductDocument } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-documents',
  templateUrl: './product-documents.html',
  styleUrl: './product-documents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDocuments {
  readonly documents = input.required<readonly ProductDocument[]>();

  // Evita presentar enlaces engañosos (#, vacíos o javascript:) cuando no existe archivo real.
  protected resolveHref(href: string | undefined): string | null {
    const trimmed = href?.trim();
    if (!trimmed || trimmed.startsWith('#') || /^javascript:/i.test(trimmed)) {
      return null;
    }
    return trimmed;
  }
}
