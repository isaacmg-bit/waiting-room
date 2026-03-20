import { Component, AfterViewInit, inject, signal, effect } from '@angular/core';
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

  private readonly iconUser = L.icon({
    iconUrl: '/assets/icons/iconuser.png',
    shadowUrl: '/assets/icons/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  private getMarkerIcon(type: string): L.DivIcon {
    const config: Record<string, { color: string; emoji: string }> = {
      show: { color: '#ef4444', emoji: '🎤' },
      rehearsalspace: { color: '#3b82f6', emoji: '🎸' },
    };

    const { color, emoji } = config[type] || { color: '#22c55e', emoji: '📍' };

    return L.divIcon({
      className: '',
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          position: relative;
          box-shadow: 0 0 12px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); font-size: 12px;">${emoji}</div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
    });
  }

  constructor() {
    effect(() => {
      const map = this.map();
      if (!map) return;

      const filteredEvents = this.locationService.getFilteredEvents();

      this.savedMarkersLayer.clearLayers();
      filteredEvents.forEach((event) => {
        const lat = event.location_point?.lat;
        const lng = event.location_point?.lng;
        if (lat == null || lng == null) return;

        const marker = L.marker([lat, lng], { icon: this.getMarkerIcon(event.event_type) });
        marker.bindTooltip(
          `
          <div style="font-size: 12px">
            <strong>${event.title}</strong><br/>
            ${event.event_type ?? ''}<br/>
            ${event.street ?? ''}<br/>
            ${event.event_date ?? ''}
          </div>
        `,
          { direction: 'top', offset: [0, -10], opacity: 0.9 },
        );
        marker.addTo(this.savedMarkersLayer);
      });
    });
  }

  ngAfterViewInit(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude: myLat, longitude: myLng } = position.coords;

      if (this.map()) return;

      const mapInstance = L.map('map', { center: [myLat, myLng], zoom: 13 });
      this.map.set(mapInstance);

      L.tileLayer(environment.leafletTileLayer).addTo(mapInstance);
      L.marker([myLat, myLng], { icon: this.iconUser }).addTo(mapInstance);
      this.savedMarkersLayer.addTo(mapInstance);

      setTimeout(() => mapInstance.invalidateSize(), 0);

      this.locationService.loadLocations();
    });
  }

  toggleFilter(category: string): void {
    this.locationService.toggleFilter(category);
  }
}
