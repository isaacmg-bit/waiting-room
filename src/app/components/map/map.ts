import { Component, AfterViewInit, inject, signal, effect } from '@angular/core';
import { LocationService } from '../../services/location-service';
import * as L from 'leaflet';
import { UserLocation } from '../../models/UserLocation';

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
  editLocationModalActive = signal<boolean>(false);
  descriptionInput = signal<string>('');
  nameInput = signal<string>('');
  categoryInput = signal<string>('');
  selectedLocation = signal<UserLocation | null>(null);
  activeFilters = signal<string[]>(['show', 'rehearsalspace']);

  private map: L.Map | null = null;
  private savedMarkersLayer = L.layerGroup();

  categoryLabels: Record<string, string> = {
    rehearsalspace: 'Rehearsal Space',
    show: 'Show',
  };

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
          const marker = L.marker([loc.lat, loc.lng], {
            icon: this.iconSavedMarker,
          });

          marker.bindTooltip(
            `
      <div style="font-size: 12px">
        <strong>${loc.name}</strong><br/>
        ${loc.description ?? ''}<br/>
     ${this.categoryLabels[loc.category] || loc.category}
      </div>
    `,
            {
              direction: 'top',
              offset: [0, -10],
              opacity: 0.9,
            },
          );
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);

            this.selectedLocation.set(loc);
            this.editLocationModalActive.set(true);

            this.nameInput.set(loc.name);
            this.descriptionInput.set(loc.description);
            this.categoryInput.set(loc.category);

            this.clickCoordinates.set({
              lat: loc.lat,
              lng: loc.lng,
            });
          });

          marker.addTo(this.savedMarkersLayer);
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

      this.map.on('click', (selectedCoords) => {
        this.selectedLocation.set(null);

        this.locationModalActive.set(true);
        this.clickCoordinates.set({
          lat: selectedCoords.latlng.lat,
          lng: selectedCoords.latlng.lng,
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
    this.clearForm();
  }

  editSavedLocation(): void {
    const location = this.selectedLocation();
    if (!location) return;

    const coords = this.clickCoordinates();

    this.locationService.editLocation({
      _id: location._id,
      lat: coords?.lat ?? location.lat,
      lng: coords?.lng ?? location.lng,
      name: this.nameInput(),
      description: this.descriptionInput(),
      category: this.categoryInput(),
    });

    this.clearForm();
  }

  deleteLocation(): void {
    const event = this.selectedLocation();
    if (!event) return;

    this.locationService.deleteLocation(event._id!);
    this.clearForm();
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

  private clearForm(): void {
    this.locationModalActive.set(false);
    this.editLocationModalActive.set(false);
    this.descriptionInput.set('');
    this.nameInput.set('');
    this.categoryInput.set('');
    this.clickCoordinates.set(null);
    this.selectedLocation.set(null);
  }
}
