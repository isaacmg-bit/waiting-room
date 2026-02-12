import { Component, AfterViewInit, inject, signal } from '@angular/core';
import { LocationService } from '../../services/location-service';
import { UserLocation } from '../../models/UserLocation';
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

  ngAfterViewInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      const iconDefault = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      L.Marker.prototype.options.icon = iconDefault;

      const myLat = position.coords.latitude;
      const myLng = position.coords.longitude;

      const map = L.map('map', { center: [myLat, myLng], zoom: 13 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.marker([myLat, myLng]).addTo(map);
      map.on('click', (selectedPosition) => {
        this.locationModalActive.set(true);
        const selectedLat = selectedPosition.latlng.lat;
        const selectedLng = selectedPosition.latlng.lng;
        this.clickCoordinates.set({ lat: selectedLat, lng: selectedLng });
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 0);

      for (const savedMarkers of this.locationService.LocationsSignal()) {
        const savedLat = savedMarkers.lat;
        const savedLng = savedMarkers.lng;
        L.marker([savedLat, savedLng]).addTo(map);
      }
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
