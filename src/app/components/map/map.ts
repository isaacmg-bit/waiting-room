import { Component, AfterViewInit, inject } from '@angular/core';
import { LocationService } from '../../services/location-service';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit {
  locationService = inject(LocationService);

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
        const selectedLat = selectedPosition.latlng.lat;
        const selectedLng = selectedPosition.latlng.lng;
        this.locationService.addLocation({
          lat: selectedLat,
          lng: selectedLng,
          name: 'Pepe',
          userId: 'Pepe',
        });
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 0);
    });
  }
}
