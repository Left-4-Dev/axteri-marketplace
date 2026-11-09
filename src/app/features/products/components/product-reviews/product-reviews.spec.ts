import { ComponentFixture, TestBed } from '@angular/core/testing';
import { W22_PRODUCT_DETAIL } from '../../data/product-detail.data';
import { ProductReviewsData } from '../../models/product-detail.model';
import { ProductReviews } from './product-reviews';

describe('ProductReviews', () => {
  let fixture: ComponentFixture<ProductReviews>;
  let element: HTMLElement;

  async function render(reviews: ProductReviewsData = W22_PRODUCT_DETAIL.reviews): Promise<void> {
    fixture = TestBed.createComponent(ProductReviews);
    fixture.componentRef.setInput('reviews', reviews);
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductReviews] }).compileComponents();
  });

  it('renders the section heading Reseñas', async () => {
    await render();
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('Reseñas');
  });

  it('renders average rating and total reviews derived from distribution', async () => {
    await render();
    expect(element.querySelector('.product-reviews__average')?.textContent?.trim()).toBe('4.4');
    expect(element.querySelector('.product-reviews__total')?.textContent).toContain('20 reseñas');
    expect(
      element
        .querySelector('.product-reviews__summary .product-reviews__stars')
        ?.getAttribute('aria-label'),
    ).toBe('Calificación promedio: 4.4 de 5 estrellas');
  });

  it('renders the full 5 to 1 star distribution with counts and derived percentages', async () => {
    await render();
    const rows = Array.from(element.querySelectorAll('.product-reviews__dist-row'));
    expect(rows).toHaveLength(5);

    const expected = [
      { starText: '5 ★', countText: '12', pctText: '(60%)' },
      { starText: '4 ★', countText: '5', pctText: '(25%)' },
      { starText: '3 ★', countText: '2', pctText: '(10%)' },
      { starText: '2 ★', countText: '1', pctText: '(5%)' },
      { starText: '1 ★', countText: '0', pctText: '(0%)' },
    ];

    expected.forEach((item, index) => {
      expect(rows[index].textContent).toContain(item.starText);
      expect(rows[index].textContent).toContain(item.countText);
      expect(rows[index].textContent).toContain(item.pctText);
    });
  });

  it('renders review items in data order with author, comment, rating, title and semantic date', async () => {
    await render();
    const articles = Array.from(element.querySelectorAll('article.product-reviews__item'));
    expect(articles).toHaveLength(W22_PRODUCT_DETAIL.reviews.items.length);

    const authors = articles.map((item) =>
      item.querySelector('.product-reviews__author')?.textContent?.trim(),
    );
    expect(authors).toEqual(W22_PRODUCT_DETAIL.reviews.items.map((item) => item.author));

    expect(articles[0].querySelector('h3')?.textContent?.trim()).toBe(
      W22_PRODUCT_DETAIL.reviews.items[0].title,
    );
    expect(articles[1].querySelector('h3')).toBeNull();

    expect(articles[0].querySelector('.product-reviews__comment')?.textContent?.trim()).toBe(
      W22_PRODUCT_DETAIL.reviews.items[0].comment,
    );
    expect(articles[0].querySelector('.product-reviews__stars')?.getAttribute('aria-label')).toBe(
      'Calificación: 5 de 5 estrellas',
    );
    expect(articles[0].querySelector('time')?.getAttribute('datetime')).toBe('2026-09-18');
    expect(articles[0].querySelector('time')?.textContent?.trim()).toContain('2026');
  });

  it('renders verified purchase indicator only when verifiedPurchase is true', async () => {
    await render();
    const articles = Array.from(element.querySelectorAll('article.product-reviews__item'));
    expect(articles[0].querySelector('.product-reviews__verified')?.textContent?.trim()).toBe(
      'Compra verificada',
    );
    expect(articles[1].querySelector('.product-reviews__verified')).not.toBeNull();
    expect(articles[2].querySelector('.product-reviews__verified')).not.toBeNull();
    expect(articles[3].querySelector('.product-reviews__verified')).toBeNull();
  });

  it('renders thumbnails with alt text when images exist and omits image list when absent', async () => {
    await render();
    const articles = Array.from(element.querySelectorAll('article.product-reviews__item'));

    const firstImages = articles[0].querySelectorAll<HTMLImageElement>(
      '.product-reviews__images img',
    );
    expect(firstImages).toHaveLength(2);
    expect(firstImages[0].getAttribute('alt')).toBe(
      W22_PRODUCT_DETAIL.reviews.items[0].images![0].alt,
    );

    expect(articles[1].querySelector('.product-reviews__images')).toBeNull();
    expect(articles[2].querySelectorAll('.product-reviews__images img')).toHaveLength(1);
    expect(articles[3].querySelector('.product-reviews__images')).toBeNull();
  });

  it('renders an honest empty state without fake ratings or NaN when there are 0 reviews', async () => {
    await render({
      average: 0,
      distribution: [
        { stars: 5, count: 0 },
        { stars: 4, count: 0 },
        { stars: 3, count: 0 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
      ],
      items: [],
    });

    expect(element.querySelector('h2')?.textContent?.trim()).toBe('Reseñas');
    expect(element.querySelector('.product-reviews__empty')?.textContent?.trim()).toBe(
      'Este producto aún no tiene reseñas.',
    );
    expect(element.querySelector('.product-reviews__summary')).toBeNull();
    expect(element.querySelectorAll('article.product-reviews__item')).toHaveLength(0);
    expect(element.textContent).not.toContain('NaN');
    expect(element.textContent).not.toContain('Infinity');
  });

  it('updates reactively when receiving a different ProductReviewsData input without retaining stale data', async () => {
    await render();

    const alternativeData: ProductReviewsData = {
      average: 5,
      distribution: [{ stars: 5, count: 1 }],
      items: [
        {
          id: 'alt-review-1',
          author: 'Lucía Paredes',
          rating: 5,
          date: '2026-10-05',
          comment: 'Repuesto recibido conforme a orden de compra.',
          verifiedPurchase: false,
        },
      ],
    };

    fixture.componentRef.setInput('reviews', alternativeData);
    await fixture.whenStable();

    expect(element.querySelector('.product-reviews__average')?.textContent?.trim()).toBe('5.0');
    expect(element.querySelector('.product-reviews__total')?.textContent).toContain('1 reseña');
    const rows = Array.from(element.querySelectorAll('.product-reviews__dist-row'));
    expect(rows[0].textContent).toContain('1');
    expect(rows[0].textContent).toContain('(100%)');
    expect(rows[1].textContent).toContain('0');
    expect(rows[1].textContent).toContain('(0%)');

    const articles = element.querySelectorAll('article.product-reviews__item');
    expect(articles).toHaveLength(1);
    expect(articles[0].querySelector('.product-reviews__author')?.textContent?.trim()).toBe(
      'Lucía Paredes',
    );
    expect(articles[0].querySelector('.product-reviews__verified')).toBeNull();
    expect(element.textContent).not.toContain('Carlos Mendoza');
  });
});
