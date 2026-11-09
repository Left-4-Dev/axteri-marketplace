import { Directive, computed, input, linkedSignal } from '@angular/core';

/** Tries the supplied artwork first, then a provisional asset, without a broken-image flash. */
@Directive({
  selector: 'img[appProductAsset]',
  exportAs: 'productAsset',
  host: {
    '[attr.src]': 'resolvedSrc()',
    '[attr.alt]': 'usingFallback() ? (fallbackAlt() ?? alt()) : alt()',
    '[style.visibility]': 'loaded() ? "visible" : "hidden"',
    '(load)': 'onLoad()',
    '(error)': 'onError()',
  },
})
export class ProductAsset {
  readonly appProductAsset = input.required<string>();
  readonly alt = input('');
  readonly fallbackSrc = input<string>();
  readonly fallbackAlt = input<string>();
  private readonly state = linkedSignal({
    source: () => [this.appProductAsset(), this.fallbackSrc()],
    computation: () => ({ fallback: false, loaded: false, failed: false }),
  });
  readonly usingFallback = computed(() => this.state().fallback);
  readonly loaded = computed(() => this.state().loaded && !this.state().failed);
  protected readonly resolvedSrc = computed(() =>
    this.usingFallback() ? this.fallbackSrc() : this.appProductAsset(),
  );

  protected onLoad(): void {
    this.state.update((state) => ({ ...state, loaded: true, failed: false }));
  }

  protected onError(): void {
    this.state.update((state) =>
      !state.fallback && this.fallbackSrc()
        ? { fallback: true, loaded: false, failed: false }
        : { ...state, loaded: false, failed: true },
    );
  }
}
