// calendar.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { UserEvent } from '../models/UserEvent';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly api = inject(ApiService);

  readonly eventsSignal = signal<UserEvent[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly calendarModalActive = signal(false);
  readonly editCalendarModalActive = signal(false);
  readonly eventTitle = signal<string>('');
  readonly eventColor = signal<string>('');
  readonly selectedDate = signal<string>('');
  readonly selectedEvent = signal<any>(null);

  constructor() {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserEvent[]>(this.getEventsUrl())
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (events) => {
          this.eventsSignal.set(events);
        },
        error: (err) => console.error('Error loading events:', err),
      });
  }

  addEvent(event: UserEvent): void {
    this.api.post<UserEvent>(this.getEventsUrl(), event).subscribe({
      next: (created) => {
        this.eventsSignal.update((events) => [...events, created]);
      },
      error: (err) => console.error('Error adding event:', err),
    });
  }

  deleteEvent(id: string): void {
    this.api.delete(`${this.getEventsUrl()}/${id}`).subscribe({
      next: () => {
        this.eventsSignal.update((events) => events.filter((e) => e.id !== id));
      },
      error: (err) => console.error('Error deleting event:', err),
    });
  }

  editEvent(id: string, body: Partial<UserEvent>): void {
    this.api.patch<UserEvent>(`${this.getEventsUrl()}/${id}`, body).subscribe({
      next: (updated) => {
        this.eventsSignal.update((events) => events.map((e) => (e.id === id ? updated : e)));
      },
      error: (err) => console.error('Error updating event:', err),
    });
  }

  openAddModal(dateStr: string): void {
    this.selectedDate.set(dateStr);
    this.calendarModalActive.set(true);
  }

  openEditModal(event: any): void {
    this.selectedEvent.set(event);
    this.eventTitle.set(event.title);
    this.eventColor.set(event.backgroundColor ?? '');
    this.selectedDate.set(event.startStr);
    this.editCalendarModalActive.set(true);
  }

  closeModals(): void {
    this.clearForm();
  }

  saveEvent(): void {
    if (!this.eventTitle() || !this.eventColor() || !this.selectedDate()) return;
    this.addEvent(this.buildEventBody());
    this.clearForm();
  }

  saveEditedEvent(): void {
    const event = this.selectedEvent();
    if (!event) return;
    if (!this.eventTitle() || !this.eventColor() || !this.selectedDate()) return;

    this.editEvent(event.id, this.buildEventBody());
    this.clearForm();
  }

  deleteSelectedEvent(): void {
    const event = this.selectedEvent();
    if (!event) return;
    this.deleteEvent(event.id);
    this.clearForm();
  }

  onTitleInput(value: string): void {
    this.eventTitle.set(value);
  }

  onColorChange(value: string): void {
    this.eventColor.set(value);
  }

  getColorCode(colorName: string): string {
    const colors: Record<string, string> = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981',
      yellow: '#eab308',
      cyan: '#06b6d4',
      pink: '#ec4899',
      purple: '#a855f7',
    };
    return colors[colorName] || '#3b82f6';
  }

  private buildEventBody(): UserEvent {
    return {
      title: this.eventTitle(),
      date: this.selectedDate(),
      color: this.eventColor(),
    };
  }

  private clearForm(): void {
    this.calendarModalActive.set(false);
    this.editCalendarModalActive.set(false);
    this.eventTitle.set('');
    this.eventColor.set('');
    this.selectedDate.set('');
    this.selectedEvent.set(null);
  }

  private getEventsUrl(): string {
    return `${environment.apiUrl}${environment.apiEventUrl}`;
  }
}
