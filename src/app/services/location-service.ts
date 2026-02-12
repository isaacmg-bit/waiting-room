import { Injectable, inject, signal } from '@angular/core';
import { UserLocation } from '../models/UserLocation';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly api = inject(ApiService);

  LocationsSignal = signal<UserLocation[]>([]);
  loadingSignal = signal<boolean>(false);

  constructor() {
    this.loadLocations();
  }

  loadLocations() {
    this.loadingSignal.set(true);
    this.api.get<UserLocation[]>(this.getLocationsUrl()).subscribe({
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

  addLocation(Location: UserLocation) {
    this.api.post<UserLocation>(this.getLocationsUrl(), Location).subscribe({
      next: (createdLocation) => {
        this.LocationsSignal.update((Locations) => [...Locations, createdLocation]);
      },
      error: (err) => console.error('Error adding Location:', err),
    });
  }

  deleteLocation(userId: string) {
    const url = `${this.getLocationsUrl()}${userId}`;
    this.api.delete<UserLocation>(url).subscribe({
      next: () => {
        this.LocationsSignal.update((Locations) => Locations.filter((u) => u.userId !== userId));
      },
      error: (err) => console.error('Error deleting Location:', err),
    });
  }

  editLocation(userId: string, body: Partial<UserLocation>) {
    const url = `${this.getLocationsUrl()}${userId}`;
    this.api.patch<UserLocation>(url, body).subscribe({
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
