import { signal, Component, AfterViewInit, inject, effect } from '@angular/core';
import { LocationService } from '../../services/location-service';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';
import { CalendarService } from '../../services/calendar-service';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit {
  readonly locationService = inject(LocationService);
  readonly calendarService = inject(CalendarService);

  private map = signal<L.Map | null>(null);
  private readonly savedMarkersLayer = L.layerGroup();
  private readonly eventsPrivateMarkersLayer = L.layerGroup();
  private readonly eventsPublicMarkersLayer = L.layerGroup();

  private readonly iconSavedMarker = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] border-2 border-white"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  private readonly iconUser = L.icon({
    iconUrl: '/assets/icons/iconuser.png',
    shadowUrl: '/assets/icons/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  constructor() {
    const addMarkers = (
      map: L.Map,
      layer: L.LayerGroup,
      items: any[],
      getLatLng: (item: any) => [number, number],
      getTooltipHtml: (item: any) => string,
      onClick?: (item: any) => void,
    ) => {
      layer.clearLayers();
      layer.addTo(map);

      items.forEach((item) => {
        const [lat, lng] = getLatLng(item);
        if (lat == null || lng == null) return;

        const marker = L.marker([lat, lng], { icon: this.iconSavedMarker });
        marker.bindTooltip(getTooltipHtml(item), {
          direction: 'top',
          offset: [0, -10],
          opacity: 0.9,
        });

        if (onClick) {
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onClick(item);
          });
        }

        marker.addTo(layer);
      });
    };

    effect(() => {
      const map = this.map();
      if (!map) return;

      const locations = this.locationService.locationsSignal();
      const filters = this.locationService.activeFilters();

      addMarkers(
        map,
        this.savedMarkersLayer,
        locations.filter((loc) => filters.includes(loc.category)),
        (loc) => [loc.lat, loc.lng],
        (loc) =>
          `<div style="font-size: 12px">
          <strong>${loc.name}</strong><br/>
          ${loc.description ?? ''}<br/>
          ${this.locationService.categoryLabels[loc.category] || loc.category}
        </div>`,
        (loc) => this.locationService.selectLocation(loc),
      );

      const publicEvents = [...this.calendarService.userPublicEventsSignal()];
      addMarkers(
        map,
        this.eventsPublicMarkersLayer,
        publicEvents,
        (event) => [event.location_point?.lat, event.location_point?.lng],
        (event) =>
          `<div style="font-size: 12px">
          <strong>${event.title}</strong><br/>
          ${event.event_type ?? ''}<br/>
          ${event.street ?? ''}<br/>
          ${event.event_date ?? ''}
        </div>`,
      );

      const privateEvents = [...this.calendarService.userPrivateEventsSignal()];
      addMarkers(
        map,
        this.eventsPrivateMarkersLayer,
        privateEvents,
        (event) => [event.location_point?.lat, event.location_point?.lng],
        (event) =>
          `<div style="font-size: 12px">
          <strong>${event.title}</strong><br/>
          ${event.event_type ?? ''}<br/>
          ${event.street ?? ''}<br/>
          ${event.event_date ?? ''}
        </div>`,
      );
    });
  }

  ngAfterViewInit(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude: myLat, longitude: myLng } = position.coords;

      if (this.map()) return;

      const mapInstance = L.map('map', {
        center: [myLat, myLng],
        zoom: 13,
      });

      this.map.set(mapInstance);

      L.tileLayer(environment.leafletTileLayer).addTo(mapInstance);
      L.marker([myLat, myLng], { icon: this.iconUser }).addTo(mapInstance);
      this.savedMarkersLayer.addTo(mapInstance);

      mapInstance.on('click', (selectedCoords) => {
        this.locationService.openAddModal(selectedCoords.latlng.lat, selectedCoords.latlng.lng);
      });

      setTimeout(() => mapInstance.invalidateSize(), 0);

      this.locationService.loadLocations();
    });
  }

  toggleFilter(category: string): void {
    this.locationService.toggleFilter(category);
  }

  saveLocation(): void {
    this.locationService.saveLocation();
  }

  editLocation(): void {
    this.locationService.editSavedLocation();
  }

  deleteLocation(): void {
    this.locationService.deleteSelectedLocation();
  }

  closeModals(): void {
    this.locationService.closeModals();
  }

  onNameInput(event: Event): void {
    this.locationService.onNameInput((event.target as HTMLInputElement).value);
  }

  onDescriptionInput(event: Event): void {
    this.locationService.onDescriptionInput((event.target as HTMLInputElement).value);
  }

  onCategoryChange(event: Event): void {
    this.locationService.onCategoryChange((event.target as HTMLSelectElement).value);
  }
}
