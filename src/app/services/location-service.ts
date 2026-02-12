import { Injectable, inject, signal } from '@angular/core';
import { Location } from '../models/Location';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly api = inject(ApiService);

  LocationsSignal = signal<Location[]>([]);
  loadingSignal = signal<boolean>(false);

  constructor() {
    this.loadLocations();
  }

  loadLocations() {
    this.loadingSignal.set(true);
    this.api.get<Location[]>(this.getLocationsUrl()).subscribe({
      next: (Locations) => {
        this.LocationsSignal.set(Locations);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading Locations:', err);
        this.loadingSignal.set(false);
      },
    });
  }

  addLocation(Location: Location) {
    this.api.post<Location>(this.getLocationsUrl(), Location).subscribe({
      next: (createdLocation) => {
        this.LocationsSignal.update((Locations) => [...Locations, createdLocation]);
      },
      error: (err) => console.error('Error adding Location:', err),
    });
  }

  deleteLocation(userId: string) {
    const url = `${this.getLocationsUrl()}${userId}`;
    this.api.delete<Location>(url).subscribe({
      next: () => {
        this.LocationsSignal.update((Locations) => Locations.filter((u) => u.userId !== userId));
      },
      error: (err) => console.error('Error deleting Location:', err),
    });
  }

  editLocation(userId: string, body: Partial<Location>) {
    const url = `${this.getLocationsUrl()}${userId}`;
    this.api.patch<Location>(url, body).subscribe({
      next: (updatedLocation) => {
        this.LocationsSignal.update((Locations) =>
          Locations.map((u) => (u.userId === userId ? updatedLocation : u)),
        );
      },
      error: (err) => console.error('Error updating Location:', err),
    });
  }

  private getLocationsUrl() {
    return `${environment.apiUrl}${environment.apiLocationUrl}`;
  }
}
