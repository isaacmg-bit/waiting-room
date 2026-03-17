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
  readonly calendarModalActive = signal<boolean>(false);
  readonly editCalendarModalActive = signal<boolean>(false);

  readonly eventTitle = signal<string>('');
  readonly eventColor = signal<string>('');
  readonly selectedDate = signal<string>('');
  readonly selectedEvent = signal<UserEvent | null>(null);

  private readonly BASE_URL: string = environment.apiEventUrl;
  private readonly ME_URL: string = `${environment.apiEventUrl}${environment.apiMeUrl}`;

  constructor() {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserEvent[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (events: UserEvent[]) => this.userEventsSignal.set(events),
        error: (err: unknown) => {
          console.error('Error loading events:', err);
          this.toast.error('Error loading events');
        },
      });
  }

  async saveEvent(): Promise<void> {
    const title = this.eventTitle();
    const color = this.eventColor();
    const date = this.selectedDate();

    if (!title || !color) return;

    this.loadingSignal.set(true);
    const payload = { title, date, color };

    try {
      const created = await firstValueFrom(this.api.post<UserEvent>(this.BASE_URL, payload));
      this.userEventsSignal.update((list: UserEvent[]) => [...list, created]);
      this.closeModals();
      this.toast.success('Event saved');
    } catch (err: unknown) {
      console.error('Error saving event:', err);
      this.toast.error('Error saving event');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateEvent(): Promise<void> {
    const id: string | undefined = this.selectedEvent()?.id;
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
      this.userEventsSignal.update((list: UserEvent[]) =>
        list.map((e: UserEvent) => (e.id === id ? updated : e)),
      );
      this.closeModals();
      this.toast.success('Event updated');
    } catch (err: unknown) {
      console.error('Error updating event:', err);
      this.toast.error('Error updating event');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteEvent(id: string): Promise<void> {
    this.loadingSignal.set(true);
    try {
      await firstValueFrom(this.api.delete<void>(`${this.BASE_URL}/${id}`));
      this.userEventsSignal.update((list: UserEvent[]) =>
        list.filter((e: UserEvent) => e.id !== id),
      );
      this.closeModals();
      this.toast.success('Event deleted');
    } catch (err: unknown) {
      console.error('Error deleting event:', err);
      this.toast.error('Error deleting event');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  openAddModal(dateStr: string): void {
    this.clearForm();
    this.selectedDate.set(dateStr);
    this.calendarModalActive.set(true);
  }

  openEditModal(event: UserEvent): void {
    this.selectedEvent.set(event);
    this.eventTitle.set(event.title || '');
    this.eventColor.set(event.color || '');

    const dateStr = event.event_date ? String(event.event_date).split('T')[0] : '';
    this.selectedDate.set(dateStr);

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
