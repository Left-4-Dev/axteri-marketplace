import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input } from '@angular/core';

@Component({
  selector: 'app-seller-section-nav',
  templateUrl: './seller-section-nav.html',
  styleUrl: './seller-section-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerSectionNav {
  private readonly document = inject(DOCUMENT);
  readonly sections = input.required<readonly { readonly id: string; readonly label: string }[]>();
  // Include the current profile path: a bare fragment resolves against Angular's base href.
  readonly profilePath = input.required<string>();

  protected navigate(event: MouseEvent, id: string): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    const window = this.document.defaultView;
    const target = this.document.getElementById(id);
    if (!window || !target || window.location.pathname !== this.profilePath()) return;

    // Avoid Router's global hash scrolling overriding the section's scroll margin.
    // Keep native links for modified clicks, while preserving history and keyboard focus.
    event.preventDefault();
    if (window.location.hash !== '#' + id) {
      window.history.pushState(window.history.state, '', this.profilePath() + '#' + id);
    }
    target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
  }
}
