import { SellerAbout } from '../../components/seller-about/seller-about';
import { SellerCertifications } from '../../components/seller-certifications/seller-certifications';
import { SellerLocation } from '../../components/seller-location/seller-location';
import { SellerInformation } from '../../components/seller-information/seller-information';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SellerProfileHero } from '../../components/seller-profile-hero/seller-profile-hero';
import { SellerSectionNav } from '../../components/seller-section-nav/seller-section-nav';
import { SellerProducts } from '../../components/seller-products/seller-products';
import { SellerBrands } from '../../components/seller-brands/seller-brands';
import { CatalogRepository } from '../../../../core/catalog/catalog.repository';
import { SELLER_PROFILES } from '../../data/seller-profile.data';

@Component({
  selector: 'app-seller-profile-page',
  imports: [
    SellerAbout,
    SellerCertifications,
    SellerLocation,
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
  private readonly catalog = inject(CatalogRepository);
  protected readonly products = computed(() =>
    this.catalog
      .productsBySeller(this.seller()?.id ?? '')
      .map((p) => this.catalog.toProductCard(p)),
  );

  protected readonly sections = computed(() =>
    (
      [
        { id: 'productos', label: 'Productos' },
        { id: 'marcas', label: 'Marcas' },
        { id: 'perfil', label: 'Perfil' },
        { id: 'informacion', label: 'Información' },
        { id: 'certificaciones', label: 'Certificaciones' },
        { id: 'ubicacion', label: 'Ubicación' },
      ] as const
    ).filter(
      (section) =>
        (section.id !== 'certificaciones' || this.seller()?.certifications.length) &&
        (section.id !== 'ubicacion' || this.seller()?.location.coordinates),
    ),
  );

  protected onContactRequest(): void {
    this.actionMessage.set(
      'El contacto con el proveedor estará disponible próximamente. No se ha enviado ninguna solicitud.',
    );
  }

  protected async onShareRequest(): Promise<void> {
    const seller = this.seller();
    if (!seller) return;
    const url = new URL('proveedores/' + encodeURIComponent(seller.id), document.baseURI);
    url.search = '';
    url.hash = '';
    let message: string;
    if (navigator.share) {
      try {
        await navigator.share({ title: seller.name, url: url.href });
        if (this.seller() === seller) this.actionMessage.set('Perfil compartido.');
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url.href);
      message = 'Enlace del perfil copiado.';
    } catch {
      message = 'No se pudo compartir el perfil.';
    }
    if (this.seller() === seller) this.actionMessage.set(message);
  }
}
