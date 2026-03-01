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

  loadLocations(): void {
    this.loadingSignal.set(true);
    this.api.get<UserLocation[]>(this.getLocationsUrl()).subscribe({
      next: (locations) => {
        this.locationsSignal.set(locations);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading Locations:', err);
        this.loadingSignal.set(false);
      },
    });
  }

  addLocation(location: UserLocation): void {
    this.api.post<UserLocation>(this.getLocationsUrl(), location).subscribe({
      next: (createdLocation) => {
        this.locationsSignal.update((locations) => [...locations, createdLocation]);
      },
      error: (err) => console.error('Error adding Location:', err),
    });
  }

  deleteLocation(id: string): void {
    const url = `${this.getLocationsUrl()}${id}`;
    this.api.delete<UserLocation>(url).subscribe({
      next: () => {
        this.locationsSignal.update((locations) => locations.filter((u) => u.id !== id));
      },
      error: (err) => console.error('Error deleting Location:', err),
    });
  }

  editLocation(body: Partial<UserLocation>): void {
    if (!body.id) {
      console.error('No id provided for edit');
      return;
    }

    const url = `${this.getLocationsUrl()}${body.id}`;
    this.api.patch<UserLocation>(url, body).subscribe({
      next: (updatedLocation) => {
        this.locationsSignal.update((locations) =>
          locations.map((loc) => (loc.id === updatedLocation.id ? updatedLocation : loc)),
        );
      },
      error: (err) => console.error('Error updating Location:', err),
    });
  }

  private getLocationsUrl(): string {
    return `${environment.apiUrl}${environment.apiLocationUrl}`;
  }
}
