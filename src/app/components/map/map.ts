// map.component.ts
import { Component, AfterViewInit, inject, effect } from '@angular/core';
import { LocationService } from '../../services/location-service';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit {
  readonly locationService = inject(LocationService);

  private map: L.Map | null = null;
  private readonly savedMarkersLayer = L.layerGroup();

  private readonly iconSavedMarker = L.icon({
    iconUrl: '/assets/icons/savedlocationicon.png',
    shadowUrl: '/assets/icons/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  private readonly iconUser = L.icon({
    iconUrl: '/assets/icons/iconuser.png',
    shadowUrl: '/assets/icons/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  constructor() {
    effect(() => {
      console.log('Effect ejecutándose...');
      console.log('Mapa existe?', !!this.map);
      console.log('Locations:', this.locationService.locationsSignal());
      console.log('Filters:', this.locationService.activeFilters());

      if (!this.map) {
        console.log('Mapa no está listo, saliendo...');
        return;
      }

      const locations = this.locationService.locationsSignal();
      const filters = this.locationService.activeFilters();

      console.log('Limpiando layer...');
      this.savedMarkersLayer.clearLayers();

      console.log('Agregando markers...');
      locations
        .filter((loc) => filters.includes(loc.category))
        .forEach((loc) => {
          console.log('Agregando marker para:', loc.name, loc.lat, loc.lng);

          const marker = L.marker([loc.lat, loc.lng], { icon: this.iconSavedMarker });

          marker.bindTooltip(
            `<div style="font-size: 12px">
              <strong>${loc.name}</strong><br/>
              ${loc.description ?? ''}<br/>
              ${this.locationService.categoryLabels[loc.category] || loc.category}
            </div>`,
            { direction: 'top', offset: [0, -10], opacity: 0.9 },
          );

          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            this.locationService.selectLocation(loc);
          });

          marker.addTo(this.savedMarkersLayer);
        });

      console.log('Markers agregados al layer');
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit iniciado');

    navigator.geolocation.getCurrentPosition((position) => {
      console.log('Posición obtenida:', position.coords);

      const { latitude: myLat, longitude: myLng } = position.coords;

      this.map = L.map('map', { center: [myLat, myLng], zoom: 13 });
      console.log('Mapa creado');

      L.tileLayer(`${environment.leafletTileLayer}`).addTo(this.map);
      L.marker([myLat, myLng], { icon: this.iconUser }).addTo(this.map);
      this.savedMarkersLayer.addTo(this.map);
      console.log('Layer agregada al mapa');

      this.map.on('click', (selectedCoords) => {
        this.locationService.openAddModal(selectedCoords.latlng.lat, selectedCoords.latlng.lng);
      });

      setTimeout(() => this.map!.invalidateSize(), 0);

      console.log('Cargando locations...');
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
