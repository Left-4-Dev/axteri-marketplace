import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { NewsPromotion } from '../../models/home-content.model';

@Component({
  selector: 'app-news',
  imports: [NgOptimizedImage],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News {
  readonly promotion = input.required<NewsPromotion>();
}
