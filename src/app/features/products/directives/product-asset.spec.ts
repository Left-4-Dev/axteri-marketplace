import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProductAsset } from './product-asset';

@Component({
  imports: [ProductAsset],
  template: `<img
    [appProductAsset]="source()"
    [fallbackSrc]="fallback()"
    alt="Motor"
    fallbackAlt="Ilustración provisional"
  />`,
})
class AssetHost {
  readonly source = signal('/real.webp');
  readonly fallback = signal<string | undefined>('/provisional.svg');
}

describe('ProductAsset', () => {
  it('prefers the real asset, falls back once and resets on a new source', async () => {
    await TestBed.configureTestingModule({ imports: [AssetHost] }).compileComponents();
    const fixture = TestBed.createComponent(AssetHost);
    await fixture.whenStable();
    const image = (fixture.nativeElement as HTMLElement).querySelector('img')!;
    expect(image.getAttribute('src')).toBe('/real.webp');
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('/provisional.svg');
    expect(image.alt).toBe('Ilustración provisional');
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('/provisional.svg');
    expect(image.style.visibility).toBe('hidden');
    fixture.componentInstance.source.set('/new-real.webp');
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('/new-real.webp');
    expect(image.alt).toBe('Motor');
    image.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(image.style.visibility).toBe('visible');
  });
});
