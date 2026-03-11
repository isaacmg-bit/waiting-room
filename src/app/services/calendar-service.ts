import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { UserEvent } from '../models/UserEvent';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly api = inject(ApiService);

  readonly eventsSignal = signal<UserEvent[]>([]);
  readonly loadingSignal = signal(false);

  private readonly BASE_URL = `${environment.apiUrl}${environment.apiEventUrl}`;

  constructor() {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserEvent[]>(this.BASE_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (events) => this.eventsSignal.set(events),
        error: (err) => console.error('Error loading events:', err),
      });
  }

  addEvent(event: UserEvent): void {
    this.api.post<UserEvent>(this.BASE_URL, event).subscribe({
      next: (created) => this.eventsSignal.update((events) => [...events, created]),
      error: (err) => console.error('Error adding event:', err),
    });
  }

  deleteEvent(id: string): void {
    this.api.delete(`${this.BASE_URL}${id}`).subscribe({
      next: () => this.eventsSignal.update((events) => events.filter((e) => e.id !== id)),
      error: (err) => console.error('Error deleting event:', err),
    });
  }

  editEvent(id: string, body: Partial<UserEvent>): void {
    this.api.patch<UserEvent>(`${this.BASE_URL}${id}`, body).subscribe({
      next: (updated) =>
        this.eventsSignal.update((events) => events.map((e) => (e.id === id ? updated : e))),
      error: (err) => console.error('Error updating event:', err),
    });
  }
}
