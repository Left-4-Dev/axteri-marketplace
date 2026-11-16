import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SellerProfile } from '../../models/seller-profile.model';

export interface SellerInformationRow {
  readonly first: { readonly label: string; readonly values: readonly string[] };
  readonly second?: { readonly label: string; readonly values: readonly string[] };
}

@Component({
  selector: 'app-seller-information',
  templateUrl: './seller-information.html',
  styleUrl: './seller-information.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerInformation {
  readonly seller = input.required<SellerProfile>();

  readonly rows = computed<readonly SellerInformationRow[]>(() => {
    const s = this.seller();
    const info = s.information;

    const leftPairs: { label: string; values: readonly string[] }[] = [];
    if (s.name) {
      leftPairs.push({ label: 'Nombre del proveedor', values: [s.name] });
    }
    if (info.supplierType) {
      leftPairs.push({ label: 'Tipo de proveedor', values: [info.supplierType] });
    }
    if (s.sector) {
      leftPairs.push({ label: 'Sector', values: [s.sector] });
    }
    if (s.location.city) {
      leftPairs.push({ label: 'Ciudad', values: [s.location.city] });
    }
    if (s.location.district) {
      leftPairs.push({ label: 'Distrito', values: [s.location.district] });
    }

    const rightPairs: { label: string; values: readonly string[] }[] = [];
    if (info.taxId) {
      rightPairs.push({ label: 'R.U.C.', values: [info.taxId] });
    }
    if (info.foundedOn) {
      rightPairs.push({ label: 'Fecha de fundación', values: [info.foundedOn] });
    }
    if (s.years !== undefined && s.years !== null) {
      rightPairs.push({ label: 'Años en la industria', values: [`${s.years} años`] });
    }
    if (info.employeeCount !== undefined && info.employeeCount !== null) {
      rightPairs.push({ label: 'N° de personal', values: [`${info.employeeCount}`] });
    }
    if (info.businessHours && info.businessHours.length > 0) {
      rightPairs.push({ label: 'Horario de servicio', values: info.businessHours });
    }

    const totalRows = Math.max(leftPairs.length, rightPairs.length);
    const result: SellerInformationRow[] = [];
    for (let i = 0; i < totalRows; i++) {
      const first = leftPairs[i];
      const second = rightPairs[i];
      if (first) {
        result.push({ first, second });
      } else if (second) {
        result.push({ first: second });
      }
    }
    return result;
  });
}
