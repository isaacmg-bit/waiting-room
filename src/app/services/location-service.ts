import { Injectable, inject, signal } from '@angular/core';
import { UserLocation } from '../models/UserLocation';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly api = inject(ApiService);

  readonly locationsSignal = signal<UserLocation[]>([]);
  readonly loadingSignal = signal(false);

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
        console.error('Error loading locations:', err);
        this.loadingSignal.set(false);
      },
    });
  }

  addLocation(location: UserLocation): void {
    this.api.post<UserLocation>(this.getLocationsUrl(), location).subscribe({
      next: (created) => this.locationsSignal.update((locs) => [...locs, created]),
      error: (err) => console.error('Error adding location:', err),
    });
  }

  deleteLocation(id: string): void {
    this.api.delete<UserLocation>(`${this.getLocationsUrl()}/${id}`).subscribe({
      next: () => this.locationsSignal.update((locs) => locs.filter((l) => l.id !== id)),
      error: (err) => console.error('Error deleting location:', err),
    });
  }

  editLocation(body: Partial<UserLocation>): void {
    if (!body.id) {
      console.error('No id provided for edit');
      return;
    }

    this.api.patch<UserLocation>(`${this.getLocationsUrl()}${body.id}`, body).subscribe({
      next: (updated) =>
        this.locationsSignal.update((locs) => locs.map((l) => (l.id === updated.id ? updated : l))),
      error: (err) => console.error('Error updating location:', err),
    });
  }

  private getLocationsUrl(): string {
    return `${environment.apiUrl}${environment.apiLocationUrl}`;
  }
}
