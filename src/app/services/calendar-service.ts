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
  loadingSignal = signal(false);

  constructor() {
    this.loadEvents();
  }

  private loadEvents() {
    this.loadingSignal.set(true);

    this.api.get<UserEvent[]>(this.getEventsUrl()).subscribe({
      next: (events) => {
        this.eventsSignal.set(events);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loadingSignal.set(false);
      },
    });
  }

  addEvent(event: UserEvent) {
    this.api.post<UserEvent>(this.getEventsUrl(), event).subscribe({
      next: (created) => {
        this.eventsSignal.update((list) => [...list, created]);
      },
    });
  }

  deleteEvent(id: string) {
    const url = `${this.getEventsUrl()}${id}`;

    this.api.delete(url).subscribe({
      next: () => {
        this.eventsSignal.update((list) => list.filter((e) => e.id !== id));
      },
    });
  }

  editEvent(id: string, body: Partial<UserEvent>) {
    const url = `${this.getEventsUrl()}${id}`;

    this.api.patch<UserEvent>(url, body).subscribe({
      next: (updated) => {
        this.eventsSignal.update((list) => list.map((e) => (e.id === updated.id ? updated : e)));
      },
    });
  }

  private getEventsUrl() {
    return `${environment.apiUrl}${environment.apiEventUrl}`;
  }
}
