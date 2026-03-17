import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { UserEvent } from '../models/UserEvent';
import { environment } from '../../environments/environment';
import { ApiServiceBack } from './apiservice-back';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly api = inject(ApiServiceBack);
  private readonly toast = inject(ToastrService);

  readonly userEventsSignal = signal<UserEvent[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly calendarModalActive = signal(false);
  readonly editCalendarModalActive = signal(false);

  readonly eventTitle = signal<string>('');
  readonly eventColor = signal<string>('');
  readonly selectedDate = signal<string>('');
  readonly selectedEvent = signal<any>(null);

  private readonly BASE_URL = environment.apiEventUrl;
  private readonly ME_URL = `${environment.apiEventUrl}${environment.apiMeUrl}`;

  constructor() {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserEvent[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (events) => this.userEventsSignal.set(events),
        error: (err) => console.error('Error loading events:', err),
      });
  }

  async saveEvent(): Promise<void> {
    if (!this.eventTitle() || !this.eventColor()) return;

    this.loadingSignal.set(true);
    const payload = {
      title: this.eventTitle(),
      date: this.selectedDate(),
      color: this.eventColor(),
    };

    try {
      const created = await firstValueFrom(this.api.post<UserEvent>(this.BASE_URL, payload));
      this.userEventsSignal.update((list) => [...list, created]);
      this.closeModals();
      this.toast.success('Event saved');
    } catch (err) {
      console.error('Error saving event:', err);
      this.toast.error('Error saving event');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteEvent(id: string): Promise<void> {
    this.loadingSignal.set(true);
    try {
      await firstValueFrom(this.api.delete(`${this.BASE_URL}/${id}`));
      this.userEventsSignal.update((list) => list.filter((e) => e.id !== id));
      this.closeModals();
      this.toast.success('Event deleted');
    } catch (err) {
      console.error('Error deleting event:', err);
      this.toast.error('Error deleting event');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateEvent(): Promise<void> {
    const id = this.selectedEvent()?.id;
    if (!id) return;

    this.loadingSignal.set(true);
    const payload = {
      title: this.eventTitle(),
      date: this.selectedDate(),
      color: this.eventColor(),
    };

    try {
      const updated = await firstValueFrom(
        this.api.patch<UserEvent>(`${this.BASE_URL}/${id}`, payload),
      );
      this.userEventsSignal.update((list) => list.map((e) => (e.id === id ? updated : e)));
      this.closeModals();
      this.toast.success('Event updated');
    } catch (err) {
      console.error('Error loading users:', err);
      this.toast.error('Error loading users');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  openAddModal(dateStr: string): void {
    this.clearForm();
    this.selectedDate.set(dateStr);
    this.calendarModalActive.set(true);
  }

  openEditModal(event: any): void {
    this.selectedEvent.set(event);
    this.eventTitle.set(event.title);
    this.eventColor.set(event.extendedProps?.color || '');
    this.selectedDate.set(event.startStr);
    this.editCalendarModalActive.set(true);
  }

  closeModals(): void {
    this.calendarModalActive.set(false);
    this.editCalendarModalActive.set(false);
    this.clearForm();
  }

  getColorCode(colorName: string): string {
    return colorName;
  }

  onColorChange(value: string): void {
    this.eventColor.set(value);
  }
  onTitleInput(value: string): void {
    this.eventTitle.set(value);
  }

  private clearForm(): void {
    this.eventTitle.set('');
    this.eventColor.set('');
    this.selectedDate.set('');
    this.selectedEvent.set(null);
  }
}
