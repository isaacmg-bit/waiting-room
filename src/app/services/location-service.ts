import { Injectable, inject, signal } from '@angular/core';
import { UserLocation } from '../models/UserLocation';
import { environment } from '../../environments/environment.prod';
import { ApiServiceBack } from './apiservice-back';
import { CalendarService } from './calendar-service';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly api = inject(ApiServiceBack);
  readonly calendarService = inject(CalendarService);

  readonly locationsSignal = signal<UserLocation[]>([]);
  readonly loadingSignal = signal(false);
  readonly activeFilters = signal(['show', 'rehearsalspace']);

  loadLocations(): void {
    this.loadingSignal.set(true);
    this.api.get<UserLocation[]>(`${environment.apiLocationUrl}`).subscribe({
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

  toggleFilter(category: string): void {
    this.activeFilters.update((filters) =>
      filters.includes(category) ? filters.filter((f) => f !== category) : [...filters, category],
    );
  }

  getFilteredEvents() {
    const locations = this.calendarService.upcomingEvents();
    const filters = this.activeFilters();
    return filters.length === 0
      ? locations
      : locations.filter((loc) => filters.includes(loc.event_type));
  }
}
