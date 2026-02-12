import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit {
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
      setTimeout(() => {
        map.invalidateSize();
      }, 0);
    });
  }
}
