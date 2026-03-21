import { Component, AfterViewInit, inject, signal, effect } from '@angular/core';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';
import { LocationService } from '../../services/location-service';
import { CalendarService } from '../../services/calendar-service';

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit {
  readonly locationService = inject(LocationService);
  private readonly calendarService = inject(CalendarService);

  private readonly mapInstance = signal<L.Map | null>(null);
  private readonly markersLayer = L.layerGroup();

  private readonly userIcon = L.icon({
    iconUrl: '/assets/icons/iconuser.png',
    shadowUrl: '/assets/icons/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  constructor() {
    effect(() => {
      const currentMap = this.mapInstance();
      if (!currentMap) return;

      const filteredEvents = this.locationService.getFilteredEvents();
      this.renderMarkers(filteredEvents);
    });
  }

  ngAfterViewInit(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.initializeMap(position.coords.latitude, position.coords.longitude);
    });
  }

  private initializeMap(lat: number, lng: number): void {
    if (this.mapInstance()) return;

    const map = L.map('map', { center: [lat, lng], zoom: 13 });
    this.mapInstance.set(map);

    L.tileLayer(environment.leafletTileLayer).addTo(map);
    L.marker([lat, lng], { icon: this.userIcon }).addTo(map);
    this.markersLayer.addTo(map);

    setTimeout(() => map.invalidateSize(), 0);
    this.locationService.loadLocations();
  }

  private renderMarkers(events: any[]): void {
    this.markersLayer.clearLayers();

    events.forEach((event) => {
      const lat = event.location_point?.lat;
      const lng = event.location_point?.lng;
      if (lat == null || lng == null) return;

      const marker = L.marker([lat, lng], {
        icon: this.createMarkerIcon(event.event_type),
      });

      marker.bindTooltip(this.createTooltipContent(event), {
        direction: 'top',
        offset: [0, -10],
        opacity: 0.9,
      });

      marker.addTo(this.markersLayer);
    });
  }

  private createMarkerIcon(type: string): L.DivIcon {
    const config: Record<string, { color: string; label: string }> = {
      show: { color: '#ef4444', label: 'Gig' },
      rehearsalspace: { color: '#3b82f6', label: 'Studio' },
    };

    const { color } = config[type] || { color: '#22c55e', label: 'Point' };

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          position: relative;
          box-shadow: 0 0 12px ${color};
        "></div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
    });
  }

  private createTooltipContent(event: any): string {
    return `
    <div style="font-size: 12px">
      <strong>${event.title}</strong><br/>
      ${this.formatEventType(event.event_type ?? '')}<br/>
      ${event.street ?? ''}<br/>
      ${event.event_date ?? ''}
    </div>
  `;
  }

  private formatEventType(type: string): string {
    const typeMap: Record<string, string> = {
      show: 'Show',
      rehearsalspace: 'Rehearsal',
    };

    return typeMap[type?.toLowerCase()] || type || '';
  }

  toggleFilter(category: string): void {
    this.locationService.toggleFilter(category);
  }

  get filteredPointsCount(): number {
    const activeFilters = this.locationService.activeFilters();
    const allPoints = this.calendarService.upcomingEvents();
    return allPoints.filter((point) => activeFilters.includes(point.event_type)).length;
  }
}
