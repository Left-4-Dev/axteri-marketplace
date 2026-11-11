import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SellerProfile } from '../../models/seller-profile.model';
import { ProductAsset } from '../../../products/directives/product-asset';
@Component({
  selector: 'app-seller-about',
  imports: [ProductAsset],
  templateUrl: './seller-about.html',
  styleUrl: './seller-about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerAbout {
  readonly seller = input.required<SellerProfile>();
}
