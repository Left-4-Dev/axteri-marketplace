import { Component } from '@angular/core';
import { Categories } from '../../components/categories/categories';
import { FeaturedProducts } from '../../components/featured-products/featured-products';
import { Hero } from '../../components/hero/hero';
import { LimitedOffers } from '../../components/limited-offers/limited-offers';
import { News } from '../../components/news/news';
import { PreferredBrands } from '../../components/preferred-brands/preferred-brands';
import { QualityBanner } from '../../components/quality-banner/quality-banner';
import { Recommendations } from '../../components/recommendations/recommendations';
import { HOME_BRANDS, HOME_CATEGORIES, HOME_NEWS } from '../../data/home-content.data';
import {
  FEATURED_PRODUCTS,
  LIMITED_OFFERS,
  RECOMMENDED_PRODUCTS,
} from '../../data/home-products.data';

@Component({
  selector: 'app-home-page',
  imports: [
    Hero,
    LimitedOffers,
    Categories,
    FeaturedProducts,
    QualityBanner,
    PreferredBrands,
    News,
    Recommendations,
  ],
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly categories = HOME_CATEGORIES;
  protected readonly brands = HOME_BRANDS;
  protected readonly news = HOME_NEWS;
  protected readonly offers = LIMITED_OFFERS;
  protected readonly featured = FEATURED_PRODUCTS;
  protected readonly recommendations = RECOMMENDED_PRODUCTS;
}
