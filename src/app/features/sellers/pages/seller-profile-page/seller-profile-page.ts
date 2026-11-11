import { SellerAbout } from '../../components/seller-about/seller-about';
import { SellerInformation } from '../../components/seller-information/seller-information';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SellerProfileHero } from '../../components/seller-profile-hero/seller-profile-hero';
import { SellerSectionNav } from '../../components/seller-section-nav/seller-section-nav';
import { SellerProducts } from '../../components/seller-products/seller-products';
import { SellerBrands } from '../../components/seller-brands/seller-brands';
import { SELLER_PRODUCTS } from '../../data/seller-products.data';
import { SELLER_PROFILES } from '../../data/seller-profile.data';

@Component({
  selector: 'app-seller-profile-page',
  imports: [
    SellerAbout,
    SellerInformation,
    RouterLink,
    SellerProfileHero,
    SellerSectionNav,
    SellerProducts,
    SellerBrands,
  ],
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
  protected readonly actionMessage = linkedSignal({
    source: this.seller,
    computation: () => '',
  });
  protected readonly products = computed(() => SELLER_PRODUCTS[this.seller()?.id ?? ''] ?? []);

  protected readonly sections = [
    { id: 'productos', label: 'Productos' },
    { id: 'marcas', label: 'Marcas' },
    { id: 'perfil', label: 'Perfil' },
    { id: 'informacion', label: 'Información' },
    { id: 'certificaciones', label: 'Certificaciones' },
    { id: 'ubicacion', label: 'Ubicación' },
  ] as const;

  protected onContactRequest(): void {
    this.actionMessage.set(
      'El contacto con el proveedor estará disponible próximamente. No se ha enviado ninguna solicitud.',
    );
  }

  protected onShareRequest(): void {
    this.actionMessage.set('La opción de compartir este perfil estará disponible próximamente.');
  }
}
