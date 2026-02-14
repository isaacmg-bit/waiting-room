import { Injectable, inject, signal } from '@angular/core';
import { UserLocation } from '../models/UserLocation';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly api = inject(ApiService);

  locationsSignal = signal<UserLocation[]>([]);
  loadingSignal = signal<boolean>(false);

  constructor() {
    this.loadLocations();
  }

  loadLocations() {
    this.loadingSignal.set(true);
    this.api.get<UserLocation[]>(this.getLocationsUrl()).subscribe({
      next: (Locations) => {
        this.locationsSignal.set(Locations);
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
        this.locationsSignal.update((Locations) => [...Locations, createdLocation]);
      },
      error: (err) => console.error('Error adding Location:', err),
    });
  }

  deleteLocation(_id: string) {
    const url = `${this.getLocationsUrl()}${_id}`;
    this.api.delete<UserLocation>(url).subscribe({
      next: () => {
        this.locationsSignal.update((Locations) => Locations.filter((u) => u._id !== _id));
      },
      error: (err) => console.error('Error deleting Location:', err),
    });
  }

  editLocation(_id: string, body: Partial<UserLocation>) {
    const url = `${this.getLocationsUrl()}${_id}`;
    this.api.patch<UserLocation>(url, body).subscribe({
      next: (updatedLocation) => {
        this.locationsSignal.update((Locations) =>
          Locations.map((u) => (u._id === _id ? updatedLocation : u)),
        );
      },
      error: (err) => console.error('Error updating Location:', err),
    });
  }

  private getLocationsUrl() {
    return `${environment.apiUrl}${environment.apiLocationUrl}`;
  }
}
