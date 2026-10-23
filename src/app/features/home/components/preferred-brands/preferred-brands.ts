import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { Brand } from '../../models/home-content.model';

@Component({
  selector: 'app-preferred-brands',
  imports: [NgOptimizedImage],
  templateUrl: './preferred-brands.html',
  styleUrl: './preferred-brands.scss',
})
export class PreferredBrands {
  readonly brands = input.required<readonly Brand[]>();
}
