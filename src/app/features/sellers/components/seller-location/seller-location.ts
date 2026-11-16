import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  GoogleMapsLoader,
  MapHandle,
  MapPoint,
  MapsApi,
  MarkerHandle,
} from '../../../../core/maps/google-maps-loader';
import { SellerLocation as Location } from '../../models/seller-profile.model';

@Component({
  selector: 'app-seller-location',
  templateUrl: './seller-location.html',
  styleUrl: './seller-location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerLocation {
  readonly location = input.required<Location>();
  readonly sellerName = input('Proveedor');
  private readonly canvas = viewChild.required<ElementRef<HTMLDivElement>>('canvas');
  private readonly loader = inject(GoogleMapsLoader);
  protected readonly status = signal<'loading' | 'ready' | 'unavailable'>('loading');
  protected readonly demo = signal(false);
  protected readonly address = computed(() =>
    [
      this.location().address,
      this.location().district,
      this.location().city,
      this.location().country,
    ]
      .filter(Boolean)
      .join(' · '),
  );

  constructor() {
    // Render effects run only in the browser, after the map container exists.
    afterRenderEffect((onCleanup) => {
      const location = this.location();
      const name = this.sellerName();
      const container = this.canvas().nativeElement;
      const failed = this.loader.failed();
      let cancelled = false;
      let map: MapHandle | undefined;
      let marker: MarkerHandle | undefined;
      let api: MapsApi | undefined;
      onCleanup(() => {
        cancelled = true;
        if (marker) {
          api?.event.clearInstanceListeners(marker);
          marker.map = null;
        }
        if (map) {
          api?.event.clearInstanceListeners(map);
          map.unbindAll();
        }
        container.replaceChildren();
      });
      this.status.set(failed ? 'unavailable' : 'loading');
      if (failed) return;
      void (async () => {
        try {
          const config = await this.loader.configuration();
          if (cancelled) return;
          const coordinates = location.coordinates;
          const center = coordinates
            ? { lat: coordinates.latitude, lng: coordinates.longitude }
            : config?.demoCenter;
          if (!config || !this.validPoint(center)) {
            this.status.set('unavailable');
            return;
          }
          this.demo.set(!coordinates);
          api = await this.loader.load(config);
          if (cancelled) return;
          map = new api.Map(container, {
            center,
            zoom: 15,
            mapId: config.mapId || 'DEMO_MAP_ID',
            zoomControl: true,
            fullscreenControl: true,
            streetViewControl: false,
            mapTypeControl: false,
          });
          marker = new api.marker.AdvancedMarkerElement({
            map,
            position: center,
            title: coordinates ? name : 'Punto de demostración; no es la ubicación del proveedor',
          });
          this.status.set('ready');
        } catch {
          if (!cancelled) this.status.set('unavailable');
        }
      })();
    });
  }

  private validPoint(point: MapPoint | undefined): point is MapPoint {
    return (
      !!point &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      Math.abs(point.lat) <= 90 &&
      Math.abs(point.lng) <= 180
    );
  }
}
