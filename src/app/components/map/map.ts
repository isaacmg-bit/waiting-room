import { Component, AfterViewInit, inject, signal } from '@angular/core';
import { LocationService } from '../../services/location-service';
import { effect } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit {
  locationService = inject(LocationService);

  locationModalActive = signal<boolean>(false);
  clickCoordinates = signal<{ lat: number; lng: number } | null>(null);
  userIdInput = signal<string>('');
  nameInput = signal<string>('');

  private map: L.Map | null = null;
  private savedMarkersLayer = L.layerGroup();

  iconDefault = L.icon({
    iconUrl: '/assets/icons/savedlocationicon.png',
    shadowUrl: '/assets/icons/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  iconUser = L.icon({
    iconUrl: '/assets/icons/iconuser.png',
    shadowUrl: '/assets/icons/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  constructor() {
    effect(() => {
      const locations = this.locationService.locationsSignal();
      if (!this.map) return;

      this.savedMarkersLayer.clearLayers();
      for (const savedMarker of locations) {
        L.marker([savedMarker.lat, savedMarker.lng], { icon: this.iconDefault }).addTo(
          this.savedMarkersLayer,
        );
      }
    });
  }

  ngAfterViewInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      const myLat = position.coords.latitude;
      const myLng = position.coords.longitude;

      this.map = L.map('map', { center: [myLat, myLng], zoom: 13 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      L.marker([myLat, myLng], { icon: this.iconUser }).addTo(this.map);
      this.savedMarkersLayer.addTo(this.map);

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

  saveLocation() {
    const coords = this.clickCoordinates();
    if (!coords) return;

    this.locationService.addLocation({
      lat: coords.lat,
      lng: coords.lng,
      name: this.nameInput(),
      userId: this.userIdInput(),
    });

    this.closeModal();
    this.userIdInput.set('');
    this.nameInput.set('');
  }

  closeModal() {
    this.locationModalActive.set(false);
  }
}
