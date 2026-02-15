import { Component, AfterViewInit, inject, signal, effect } from '@angular/core';
import { LocationService } from '../../services/location-service';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit {
  private locationService = inject(LocationService);

  private mapReady = signal<boolean>(false);
  private clickCoordinates = signal<{ lat: number; lng: number } | null>(null);
  locationModalActive = signal<boolean>(false);
  descriptionInput = signal<string>('');
  nameInput = signal<string>('');
  categoryInput = signal<string>('');
  activeFilters = signal<string[]>(['show', 'rehearsalspace']);

  private map: L.Map | null = null;
  private savedMarkersLayer = L.layerGroup();

  private iconSavedMarker = L.icon({
    iconUrl: '/assets/icons/savedlocationicon.png',
    shadowUrl: '/assets/icons/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  private iconUser = L.icon({
    iconUrl: '/assets/icons/iconuser.png',
    shadowUrl: '/assets/icons/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  constructor() {
    effect(() => {
      if (!this.mapReady()) return;

      const locations = this.locationService.locationsSignal();
      const filters = this.activeFilters();

      this.savedMarkersLayer.clearLayers();
      locations
        .filter((loc) => filters.includes(loc.category))
        .forEach((loc) => {
          L.marker([loc.lat, loc.lng], { icon: this.iconSavedMarker }).addTo(
            this.savedMarkersLayer,
          );
        });
    });
  }

  ngAfterViewInit(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      const myLat = position.coords.latitude;
      const myLng = position.coords.longitude;

      this.map = L.map('map', { center: [myLat, myLng], zoom: 13 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      L.marker([myLat, myLng], { icon: this.iconUser }).addTo(this.map);
      this.savedMarkersLayer.addTo(this.map);

      this.mapReady.set(true);

      this.map.on('click', (selectedPosition) => {
        this.locationModalActive.set(true);
        this.clickCoordinates.set({
          lat: selectedPosition.latlng.lat,
          lng: selectedPosition.latlng.lng,
        });
      });

      setTimeout(() => this.map!.invalidateSize(), 0);
    });
  }

  toggleFilter(category: string): void {
    if (this.activeFilters().includes(category)) {
      this.activeFilters.update((filters) => filters.filter((f) => f !== category));
    } else {
      this.activeFilters.update((filters) => [...filters, category]);
    }
  }

  saveLocation(): void {
    const coords = this.clickCoordinates();
    if (!coords || !this.nameInput() || !this.categoryInput()) return;
    this.locationService.addLocation({
      lat: coords.lat,
      lng: coords.lng,
      name: this.nameInput(),
      description: this.descriptionInput(),
      category: this.categoryInput(),
    });
    this.locationModalActive.set(false);
    this.descriptionInput.set('');
    this.nameInput.set('');
    this.categoryInput.set('');
    this.clickCoordinates.set(null);
  }

  onNameInput(event: Event): void {
    this.nameInput.set((event.target as HTMLInputElement).value);
  }

  onDescriptionInput(event: Event): void {
    this.descriptionInput.set((event.target as HTMLInputElement).value);
  }

  onCategoryChange(event: Event): void {
    this.categoryInput.set((event.target as HTMLSelectElement).value);
  }
}
