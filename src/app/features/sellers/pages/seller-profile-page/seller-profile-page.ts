import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SELLER_PROFILES } from '../../data/seller-profile.data';

@Component({
  selector: 'app-seller-profile-page',
  imports: [RouterLink],
  templateUrl: './seller-profile-page.html',
  styleUrl: './seller-profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerProfilePage {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly seller = computed(() =>
    SELLER_PROFILES.find((item) => item.id === this.params().get('id')),
  );

  protected readonly sections = [
    { id: 'productos', label: 'Productos' },
    { id: 'marcas', label: 'Marcas' },
    { id: 'perfil', label: 'Perfil' },
    { id: 'informacion', label: 'Información' },
    { id: 'certificaciones', label: 'Certificaciones' },
    { id: 'ubicacion', label: 'Ubicación' },
  ] as const;
}
