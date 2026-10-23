import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { Category } from '../../models/home-content.model';

@Component({
  selector: 'app-categories',
  imports: [NgOptimizedImage],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  readonly categories = input.required<readonly Category[]>();
}
