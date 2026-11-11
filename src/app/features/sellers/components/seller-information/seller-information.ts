import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { SellerProfile } from '../../models/seller-profile.model';

@Component({
  selector: 'app-seller-information',

  templateUrl: './seller-information.html',
  styleUrl: './seller-information.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerInformation {
  readonly seller = input.required<SellerProfile>();

  readonly entries = computed(() => {
    const s = this.seller();
    return [
      ['Nombre del proveedor', s.name],
      ['R.U.C.', s.information.taxId],
      ['Tipo de proveedor', s.information.supplierType],
      ['Fecha de fundación', s.information.foundedOn],
      ['Sector', s.sector],
      ['Años en la industria', s.years],
      ['Ciudad', s.location.city],
      ['N.º de personal', s.information.employeeCount],
      ['Distrito', s.location.district],
      ['Horario de servicio', s.information.businessHours.join(' · ')],
    ]
      .filter((entry) => entry[1] !== undefined && entry[1] !== '')
      .map(([label, value]) => ({ label, value }));
  });
}
