import { Injectable, inject, signal } from '@angular/core';
import { UserLocation } from '../models/UserLocation';
import { environment } from '../../environments/environment';
import { ApiServiceBack } from './apiservice-back';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly api = inject(ApiServiceBack);

  readonly locationsSignal = signal<UserLocation[]>([]);
  readonly loadingSignal = signal(false);
  readonly locationModalActive = signal(false);
  readonly editLocationModalActive = signal(false);
  readonly descriptionInput = signal('');
  readonly nameInput = signal('');
  readonly categoryInput = signal('');
  readonly selectedLocation = signal<UserLocation | null>(null);
  readonly activeFilters = signal(['show', 'rehearsalspace']);
  readonly clickCoordinates = signal<{ lat: number; lng: number } | null>(null);

  private readonly URL_LOCATIONS = `${environment.apiLocationUrl}`;

  readonly categoryLabels: Record<string, string> = {
    rehearsalspace: 'Rehearsal Space',
    show: 'Show',
  };

  loadLocations(): void {
    this.loadingSignal.set(true);
    this.api.get<UserLocation[]>(this.URL_LOCATIONS).subscribe({
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

  loadLocationId(userId: string): void {
    this.loadingSignal.set(true);
    this.api.get<UserLocation[]>(`${this.URL_LOCATIONS}/${userId}`).subscribe({
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
    this.api
      .post<UserLocation>(this.URL_LOCATIONS, location)

      .subscribe({
        next: (created) => this.locationsSignal.update((locs) => [...locs, created]),
        error: (err) => console.error('Error adding location:', err),
      });
  }

  deleteLocation(id: string): void {
    this.api
      .delete<UserLocation>(`${this.URL_LOCATIONS}/${id}`)

      .subscribe({
        next: () => this.locationsSignal.update((locs) => locs.filter((l) => l.id !== id)),
        error: (err) => console.error('Error deleting location:', err),
      });
  }

  editLocation(body: Partial<UserLocation>): void {
    if (!body.id) {
      console.error('No id provided for edit');
      return;
    }

    this.api
      .patch<UserLocation>(`${this.URL_LOCATIONS}/${body.id}`, body)

      .subscribe({
        next: (updated) =>
          this.locationsSignal.update((locs) =>
            locs.map((l) => (l.id === updated.id ? updated : l)),
          ),
        error: (err) => console.error('Error updating location:', err),
      });
  }

  toggleFilter(category: string): void {
    this.activeFilters.update((filters) =>
      filters.includes(category) ? filters.filter((f) => f !== category) : [...filters, category],
    );
  }

  saveLocation(): void {
    const coords = this.clickCoordinates();
    if (!coords || !this.nameInput() || !this.categoryInput()) return;

    this.addLocation({
      lat: coords.lat,
      lng: coords.lng,
      name: this.nameInput(),
      description: this.descriptionInput(),
      category: this.categoryInput(),
    } as UserLocation);
    this.clearForm();
  }

  editSavedLocation(): void {
    const location = this.selectedLocation();
    if (!location) return;

    const coords = this.clickCoordinates();
    this.editLocation({
      id: location.id,
      lat: coords?.lat ?? location.lat,
      lng: coords?.lng ?? location.lng,
      name: this.nameInput(),
      description: this.descriptionInput(),
      category: this.categoryInput(),
    });
    this.clearForm();
  }

  deleteSelectedLocation(): void {
    const location = this.selectedLocation();
    if (!location) return;
    this.deleteLocation(location.id!);
    this.clearForm();
  }

  selectLocation(location: UserLocation): void {
    this.selectedLocation.set(location);
    this.editLocationModalActive.set(true);
    this.nameInput.set(location.name);
    this.descriptionInput.set(location.description);
    this.categoryInput.set(location.category);
    this.clickCoordinates.set({ lat: location.lat, lng: location.lng });
  }

  openAddModal(lat: number, lng: number): void {
    this.selectedLocation.set(null);
    this.locationModalActive.set(true);
    this.clickCoordinates.set({ lat, lng });
  }

  closeModals(): void {
    this.clearForm();
  }

  onNameInput(value: string): void {
    this.nameInput.set(value);
  }

  onDescriptionInput(value: string): void {
    this.descriptionInput.set(value);
  }

  onCategoryChange(value: string): void {
    this.categoryInput.set(value);
  }

  private clearForm(): void {
    this.locationModalActive.set(false);
    this.editLocationModalActive.set(false);
    this.descriptionInput.set('');
    this.nameInput.set('');
    this.categoryInput.set('');
    this.clickCoordinates.set(null);
    this.selectedLocation.set(null);
  }
}
