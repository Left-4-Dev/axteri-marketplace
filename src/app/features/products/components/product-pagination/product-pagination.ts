import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type PaginationItem =
  | { readonly kind: 'page'; readonly page: number; readonly id: string }
  | { readonly kind: 'ellipsis'; readonly id: string };

@Component({
  selector: 'app-product-pagination',
  templateUrl: './product-pagination.html',
  styleUrl: './product-pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPagination {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly activePage = computed<number>(() => {
    const total = this.totalPages();
    if (total <= 0) {
      return 1;
    }
    return Math.min(Math.max(1, this.currentPage()), total);
  });

  protected readonly isPrevDisabled = computed<boolean>(
    () => this.totalPages() <= 1 || this.activePage() <= 1,
  );

  protected readonly isNextDisabled = computed<boolean>(
    () => this.totalPages() <= 1 || this.activePage() >= this.totalPages(),
  );

  protected readonly visibleItems = computed<readonly PaginationItem[]>(() => {
    const total = this.totalPages();
    if (total <= 1) {
      return [];
    }

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => {
        const page = index + 1;
        return { kind: 'page', page, id: `page-${page}` };
      });
    }

    const current = this.activePage();
    const items: PaginationItem[] = [{ kind: 'page', page: 1, id: 'page-1' }];

    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);

    if (current <= 3) {
      start = 2;
      end = 4;
    } else if (current >= total - 2) {
      start = total - 3;
      end = total - 1;
    }

    if (start > 2) {
      items.push({ kind: 'ellipsis', id: 'ellipsis-start' });
    }

    for (let page = start; page <= end; page++) {
      items.push({ kind: 'page', page, id: `page-${page}` });
    }

    if (end < total - 1) {
      items.push({ kind: 'ellipsis', id: 'ellipsis-end' });
    }

    items.push({ kind: 'page', page: total, id: `page-${total}` });
    return items;
  });

  protected goToPrevious(): void {
    if (this.isPrevDisabled()) {
      return;
    }
    this.selectPage(this.activePage() - 1);
  }

  protected goToNext(): void {
    if (this.isNextDisabled()) {
      return;
    }
    this.selectPage(this.activePage() + 1);
  }

  protected selectPage(page: number): void {
    const total = this.totalPages();
    if (total <= 1 || page < 1 || page > total || page === this.activePage()) {
      return;
    }
    this.pageChange.emit(page);
  }
}
