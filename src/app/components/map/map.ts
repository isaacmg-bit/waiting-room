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

  // State
  locationModalActive = signal(false);
  editLocationModalActive = signal(false);
  selectedDate = signal<{ lat: number; lng: number } | null>(null);
  descriptionInput = signal('');
  nameInput = signal('');
  categoryInput = signal('');
  selectedLocation = signal<UserLocation | null>(null);
  activeFilters = signal<string[]>(['show', 'rehearsalspace']);

  private map!: L.Map;
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
    // React to location changes
    effect(() => {
      if (!this.map) return;

      const locations = this.locationService.locationsSignal();
      const filters = this.activeFilters();

      this.savedMarkersLayer.clearLayers();

      locations
        .filter((loc) => filters.includes(loc.category))
        .forEach((loc) => this.createMarker(loc));
    });
  }

  ngAfterViewInit(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.initMap(position);
    });
  }

  private initMap(position: GeolocationPosition) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    this.map = L.map('map', {
      center: [lat, lng],
      zoom: 13,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    L.marker([lat, lng], { icon: this.iconUser }).addTo(this.map);

    this.savedMarkersLayer.addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.selectedLocation.set(null);

      this.locationModalActive.set(true);

      this.selectedDate.set({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    });

    setTimeout(() => this.map.invalidateSize(), 0);
  }

  private createMarker(loc: UserLocation) {
    const marker = L.marker([loc.lat, loc.lng], {
      icon: this.iconSavedMarker,
    });

    marker.bindTooltip(
      `
      <div style="font-size:12px">
        <strong>${loc.name}</strong><br/>
        ${loc.description ?? ''}<br/>
        ${loc.category}
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
      this.descriptionInput.set(loc.description ?? '');
      this.categoryInput.set(loc.category);
    });

    marker.addTo(this.savedMarkersLayer);
  }

  toggleFilter(category: string) {
    if (this.activeFilters().includes(category)) {
      this.activeFilters.update((f) => f.filter((x) => x !== category));
    } else {
      this.activeFilters.update((f) => [...f, category]);
    }
  }

  saveLocation() {
    const coords = this.selectedDate();

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

  editSavedLocation() {
    const location = this.selectedLocation();
    if (!location || !location.id) return;

    const coords = this.selectedDate();

    this.locationService.editLocation({
      id: location.id,
      lat: coords?.lat ?? location.lat,
      lng: coords?.lng ?? location.lng,
      name: this.nameInput(),
      description: this.descriptionInput(),
      category: this.categoryInput(),
    });

    this.clearForm();
  }

  deleteLocation() {
    const location = this.selectedLocation();
    if (!location) return;

    this.locationService.deleteLocation(location.id!);
    this.clearForm();
  }

  private clearForm() {
    this.locationModalActive.set(false);
    this.editLocationModalActive.set(false);
    this.descriptionInput.set('');
    this.nameInput.set('');
    this.categoryInput.set('');
    this.selectedDate.set(null);
    this.selectedLocation.set(null);
  }
}
