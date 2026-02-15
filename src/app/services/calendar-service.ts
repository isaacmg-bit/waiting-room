import { Injectable, inject, signal } from '@angular/core';
import { UserEvent } from '../models/UserEvent';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly api = inject(ApiService);

  eventsSignal = signal<UserEvent[]>([]);
  loadingSignal = signal<boolean>(false);

  constructor() {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loadingSignal.set(true);
    this.api.get<UserEvent[]>(this.getEventsUrl()).subscribe({
      next: (events) => {
        this.eventsSignal.set(events);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.loadingSignal.set(false);
      },
    });
  }

  addEvent(event: UserEvent): void {
    this.api.post<UserEvent>(this.getEventsUrl(), event).subscribe({
      next: (createdEvent) => {
        this.eventsSignal.update((events) => [...events, createdEvent]);
      },
      error: (err) => console.error('Error adding event:', err),
    });
  }

  deleteEvent(_id: string): void {
    const url = `${this.getEventsUrl()}${_id}`;
    this.api.delete<UserEvent>(url).subscribe({
      next: () => {
        this.eventsSignal.update((events) => events.filter((u) => u._id !== _id));
      },
      error: (err) => console.error('Error deleting event:', err),
    });
  }

  editEvent(_id: string, body: Partial<UserEvent>): void {
    const url = `${this.getEventsUrl()}${_id}`;
    this.api.patch<UserEvent>(url, body).subscribe({
      next: (updatedEvent) => {
        this.eventsSignal.update((events) => events.map((u) => (u._id === _id ? updatedEvent : u)));
      },
      error: (err) => console.error('Error updating event:', err),
    });
  }

  private getEventsUrl(): string {
    return `${environment.apiUrl}${environment.apiEventUrl}`;
  }
}
