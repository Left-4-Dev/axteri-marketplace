import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  GoogleMapsConfig,
  GoogleMapsLoader,
  MapsApi,
} from '../../../../core/maps/google-maps-loader';
import { SellerLocation } from './seller-location';
import { LDF_PROJECTS_SELLER } from '../../data/seller-profile.data';

describe('SellerLocation', () => {
  let fixture: ComponentFixture<SellerLocation>;
  const location = {
    country: 'Perú',
    city: 'Lima',
    district: 'San Miguel',
    address: 'Dirección del input',
    coordinates: { latitude: -12, longitude: -77 },
  };
  const configuration = vi.fn();
  const load = vi.fn();
  const failed = signal(false);
  const createMap = vi.fn();
  const createMarker = vi.fn();
  const unbindAll = vi.fn();
  const clearInstanceListeners = vi.fn();
  let marker: { map: object | null };
  const api = {
    ControlPosition: { TOP_LEFT: 1, LEFT_CENTER: 4, LEFT_BOTTOM: 6 },
    Map: class {
      unbindAll = unbindAll;
      constructor(...args: unknown[]) {
        createMap(...args);
      }
    },
    marker: {
      AdvancedMarkerElement: class {
        map: object | null = {};
        constructor(...args: unknown[]) {
          createMarker(...args);
          marker = { map: {} };
          return marker;
        }
      },
    },
    event: { clearInstanceListeners },
  } as MapsApi;
  beforeEach(() => {
    vi.clearAllMocks();
    failed.set(false);
    configuration.mockResolvedValue({ apiKey: 'test-only', mapId: 'DEMO_MAP_ID' });
    load.mockResolvedValue(api);
    TestBed.configureTestingModule({
      providers: [{ provide: GoogleMapsLoader, useValue: { configuration, load, failed } }],
    });
    fixture = TestBed.createComponent(SellerLocation);
    fixture.componentRef.setInput('location', location);
    fixture.componentRef.setInput('sellerName', 'Proveedor de prueba');
  });
  afterEach(() => fixture.destroy());
  const text = () => (fixture.nativeElement as HTMLElement).textContent!;

  it('renders its container and address while configuration is loading', async () => {
    configuration.mockReturnValue(
      new Promise(() => {
        /* Remains pending during this test. */
      }),
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-label="Mapa de ubicación"]')).not.toBeNull();
    expect(text()).toContain('Cargando mapa');
    expect(text()).toContain('Dirección del input · San Miguel · Lima · Perú');
    expect(load).not.toHaveBeenCalled();
  });
  it('keeps loading until the API resolves', async () => {
    let resolve!: (api: MapsApi) => void;
    load.mockReturnValue(
      new Promise<MapsApi>((r) => {
        resolve = r;
      }),
    );
    await fixture.whenStable();
    expect(load).toHaveBeenCalledOnce();
    expect(text()).toContain('Cargando mapa');
    resolve(api);
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(text()).not.toContain('Cargando mapa');
    });
  });
  it('requests initialization with input coordinates and cleans resources on destroy', async () => {
    fixture.componentRef.setInput('location', LDF_PROJECTS_SELLER.location);
    await fixture.whenStable();
    expect(load).toHaveBeenCalledWith({ apiKey: 'test-only', mapId: 'DEMO_MAP_ID' });
    expect(createMap).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        center: { lat: -12.0701228, lng: -77.0969605 },
        zoom: 15,
        zoomControl: true,
      }),
    );
    expect(createMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Proveedor de prueba',
        position: { lat: -12.0701228, lng: -77.0969605 },
      }),
    );
    fixture.destroy();
    expect(marker.map).toBeNull();
    expect(unbindAll).toHaveBeenCalledOnce();
    expect(clearInstanceListeners).toHaveBeenCalledTimes(2);
  });
  it('falls back without configuration or sufficient location', async () => {
    configuration.mockResolvedValue(null);
    await fixture.whenStable();
    expect(text()).toContain('Mapa no disponible');
    expect(load).not.toHaveBeenCalled();
    configuration.mockResolvedValue({ apiKey: 'test-only' });
    fixture.componentRef.setInput('location', { city: 'Lima', district: '', country: 'Perú' });
    await fixture.whenStable();
    expect(load).not.toHaveBeenCalled();
    expect(text()).toContain('Mapa no disponible');
  });
  it('handles API rejection and late authentication failure without breaking the section', async () => {
    load.mockRejectedValue(new Error('network'));
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(text()).toContain('Mapa no disponible');
    });
    load.mockResolvedValue(api);
    fixture.componentRef.setInput('sellerName', 'Otro proveedor');
    await fixture.whenStable();
    expect(text()).not.toContain('Mapa no disponible');
    failed.set(true);
    await fixture.whenStable();
    expect(text()).toContain('Mapa no disponible');
    expect(marker.map).toBeNull();
  });
  it('labels configured preview coordinates as demonstration, never as the seller location', async () => {
    configuration.mockResolvedValue({
      apiKey: 'test-only',
      demoCenter: { lat: -12.08, lng: -77.08 },
    } satisfies GoogleMapsConfig);
    fixture.componentRef.setInput('location', {
      city: 'Lima',
      district: 'San Miguel',
      country: 'Perú',
    });
    await fixture.whenStable();
    expect(text()).toContain('Mapa de demostración');
    expect(createMarker).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Punto de demostración; no es la ubicación del proveedor' }),
    );
  });
  it('does not initialize after destruction while the API is pending', async () => {
    let resolve!: (api: MapsApi) => void;
    load.mockReturnValue(
      new Promise<MapsApi>((r) => {
        resolve = r;
      }),
    );
    await fixture.whenStable();
    fixture.destroy();
    resolve(api);
    await Promise.resolve();
    expect(createMap).not.toHaveBeenCalled();
  });
});
