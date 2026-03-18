import {
  Component,
  inject,
  viewChild,
  AfterViewInit,
  OnDestroy,
  effect,
  signal,
} from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, CalendarApi } from '@fullcalendar/core';
import { CalendarService } from '../../services/calendar-service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements AfterViewInit, OnDestroy {
  calendarComponent = viewChild<FullCalendarComponent>('calendar');
  readonly calendarService = inject(CalendarService);

  private calendarApi: CalendarApi | null = null;
  private readonly apiReady = signal(false);

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    displayEventTime: false,
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg) => this.calendarService.openAddModal(arg.dateStr),

    eventClick: (arg) => {
      const eventId = arg.event.id;
      const originalEvent = this.calendarService.userEventsSignal().find((e) => e.id === eventId);

      if (originalEvent) {
        this.calendarService.openEditModal(originalEvent);
      }
    },

    events: (info, successCallback) => {
      const events = this.calendarService.userEventsSignal().map((event) => ({
        id: event.id,
        title: event.title,
        start: event.event_date,
        backgroundColor: this.calendarService.getColorCode(event.color),
        borderColor: this.calendarService.getColorCode(event.color),
        extendedProps: { color: event.color },
      }));
      successCallback(events);
    },
  };

  constructor() {
    effect(() => {
      if (!this.apiReady() || !this.calendarApi) return;
      this.calendarService.userEventsSignal();
      this.calendarApi.refetchEvents();
    });
  }

  ngAfterViewInit(): void {
    const calendar = this.calendarComponent();
    if (calendar) {
      this.calendarApi = calendar.getApi();
      this.apiReady.set(true);
    }
    this.calendarService.loadEvents();
  }

  ngOnDestroy(): void {
    this.calendarApi = null;
    this.apiReady.set(false);
  }
  async saveEvent(): Promise<void> {
    await this.calendarService.saveEvent();
  }

  async editEvent(): Promise<void> {
    await this.calendarService.updateEvent();
  }

  async deleteEvent(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this event?')) {
      await this.calendarService.deleteEvent(id);
    }
  }

  onTitleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.calendarService.onTitleInput(value);
  }

  onColorChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.calendarService.onColorChange(value);
  }

  closeModals(): void {
    this.calendarService.closeModals();
  }
}
