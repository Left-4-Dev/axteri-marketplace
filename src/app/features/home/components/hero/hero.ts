import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss', './hero-search.scss', './hero-responsive.scss'],
})
export class Hero {
  protected readonly aiModeEnabled = signal(false);

  protected toggleAiMode(): void {
    this.aiModeEnabled.update((enabled) => !enabled);
  }
}
