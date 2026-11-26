import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss', './hero-search.scss', './hero-responsive.scss'],
})
export class Hero {
  private readonly router = inject(Router);

  protected onQueryEnter(event: Event, rawQuery: string): void {
    const keyEvent = event as KeyboardEvent;
    if (keyEvent.shiftKey || keyEvent.isComposing) {
      return;
    }
    event.preventDefault();
    this.submitSearch(rawQuery);
  }

  protected onSubmit(event: Event, rawQuery: string): void {
    event.preventDefault();
    this.submitSearch(rawQuery);
  }

  private submitSearch(rawQuery: string): void {
    const query = rawQuery.trim();
    if (!query) {
      return;
    }
    void this.router.navigate(['/productos'], { queryParams: { q: query } });
  }
}
