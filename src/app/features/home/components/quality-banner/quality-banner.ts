import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-quality-banner',
  templateUrl: './quality-banner.html',
  styleUrl: './quality-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualityBanner {
  readonly imageUrl = input<string>();
}
