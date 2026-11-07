import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { ProductImage } from '../../models/product-detail.model';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGallery {
  readonly images = input.required<readonly [ProductImage, ...ProductImage[]]>();
  protected readonly selectedIndex = linkedSignal({ source: this.images, computation: () => 0 });
  protected readonly selectedImage = computed(() => this.images()[this.selectedIndex()]);
  protected readonly favorite = signal(false);
}
