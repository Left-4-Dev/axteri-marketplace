import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { ProductAsset } from '../../../products/directives/product-asset';
import { SellerProfile } from '../../models/seller-profile.model';

@Component({
  selector: 'app-seller-profile-hero',
  imports: [Button, DecimalPipe, ProductAsset],
  templateUrl: './seller-profile-hero.html',
  styleUrl: './seller-profile-hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerProfileHero {
  readonly seller = input.required<SellerProfile>();
  readonly contactRequest = output<void>();
  readonly shareRequest = output<void>();

  protected readonly locationLabel = computed(() =>
    [this.seller().location.district, this.seller().location.city].filter(Boolean).join(', '),
  );
}
