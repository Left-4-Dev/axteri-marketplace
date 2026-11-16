import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

export interface MapPoint {
  lat: number;
  lng: number;
}
export interface GoogleMapsConfig {
  apiKey: string;
  mapId?: string;
  /** Optional development-only preview. Never represents the seller's approved address. */
  demoCenter?: MapPoint;
}
export interface MapHandle {
  unbindAll(): void;
}
export interface MarkerHandle {
  map: MapHandle | null;
}
export interface MapsApi {
  Map: new (
    container: HTMLElement,
    options: {
      center: MapPoint;
      zoom: number;
      mapId: string;
      streetViewControl: boolean;
      mapTypeControl: boolean;
      zoomControl: boolean;
      fullscreenControl: boolean;
    },
  ) => MapHandle;
  marker: {
    AdvancedMarkerElement: new (options: {
      map: MapHandle;
      position: MapPoint;
      title: string;
    }) => MarkerHandle;
  };
  event: { clearInstanceListeners(instance: object): void };
}
type MapsWindow = Window & {
  google?: { maps: MapsApi };
  axteriMapsReady?: () => void;
  gm_authFailure?: () => void;
};

/** Browser boundary: one configuration request and one API script per application. */
@Injectable({ providedIn: 'root' })
export class GoogleMapsLoader {
  private readonly document = inject(DOCUMENT);
  private configRequest?: Promise<GoogleMapsConfig | null>;
  private scriptRequest?: Promise<MapsApi>;
  readonly failed = signal(false);

  configuration(): Promise<GoogleMapsConfig | null> {
    return (this.configRequest ??= this.readConfiguration());
  }

  private async readConfiguration(): Promise<GoogleMapsConfig | null> {
    if (!this.document.defaultView) return null;
    try {
      const response = await fetch(
        new URL('config/google-maps.local.json', this.document.baseURI),
        {
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!response.ok) return null;
      const config: GoogleMapsConfig = await response.json();
      return typeof config.apiKey === 'string' && config.apiKey.trim() ? config : null;
    } catch {
      return null;
    }
  }

  load(config: GoogleMapsConfig): Promise<MapsApi> {
    return (this.scriptRequest ??= new Promise((resolve, reject) => {
      const browser = this.document.defaultView as MapsWindow | null;
      if (!browser) {
        reject(new Error('Browser unavailable'));
        return;
      }
      const previousAuthFailure = browser.gm_authFailure;
      const fail = () => {
        this.failed.set(true);
        clearTimeout(timeout);
        reject(new Error('Maps unavailable'));
      };
      // A deadline bounds network stalls; readiness itself uses Google's callback.
      const timeout = setTimeout(fail, 15000);
      browser.gm_authFailure = () => {
        fail();
        previousAuthFailure?.();
      };
      browser.axteriMapsReady = () => {
        clearTimeout(timeout);
        if (browser.google?.maps.Map && browser.google.maps.marker?.AdvancedMarkerElement) {
          resolve(browser.google.maps);
        } else {
          fail();
        }
        delete browser.axteriMapsReady;
      };
      if (browser.google?.maps.Map && browser.google.maps.marker?.AdvancedMarkerElement) {
        browser.axteriMapsReady();
        return;
      }
      const script = this.document.createElement('script');
      const params = new URLSearchParams({
        key: config.apiKey,
        loading: 'async',
        libraries: 'maps,marker',
        callback: 'axteriMapsReady',
        v: 'weekly',
        language: 'es',
      });
      script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
      script.async = true;
      script.onerror = fail;
      this.document.head.append(script);
    }));
  }
}
