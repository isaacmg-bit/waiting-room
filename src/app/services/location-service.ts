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
  loadingSignal = signal(false);

  constructor() {
    this.loadLocations();
  }

  loadLocations() {
    this.loadingSignal.set(true);

    this.api.get<UserLocation[]>(this.getLocationsUrl()).subscribe({
      next: (locations) => {
        this.locationsSignal.set(locations);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loadingSignal.set(false);
      },
    });
  }

  addLocation(location: UserLocation) {
    this.api.post<UserLocation>(this.getLocationsUrl(), location).subscribe({
      next: (created) => {
        this.locationsSignal.update((list) => [...list, created]);
      },
      error: (err) => console.error(err),
    });
  }

  editLocation(location: Partial<UserLocation> & { id: string }) {
    const url = `${this.getLocationsUrl()}${location.id}`;

    this.api.patch<UserLocation>(url, location).subscribe({
      next: (updated) => {
        this.locationsSignal.update((list) => list.map((l) => (l.id === updated.id ? updated : l)));
      },
      error: (err) => console.error(err),
    });
  }

  deleteLocation(id: string) {
    const url = `${this.getLocationsUrl()}${id}`;

    this.api.delete(url).subscribe({
      next: () => {
        this.locationsSignal.update((list) => list.filter((l) => l.id !== id));
      },
      error: (err) => console.error(err),
    });
  }

  private getLocationsUrl() {
    return `${environment.apiUrl}${environment.apiLocationUrl}`;
  }
}
