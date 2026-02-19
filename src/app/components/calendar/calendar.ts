import { Component, signal, inject, ViewChild, effect, AfterViewInit } from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import { CalendarService } from '../../services/calendar-service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { UserEvent } from '../../models/UserEvent';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  calendarService = inject(CalendarService);

  calendarModalActive = signal<boolean>(false);
  editCalendarModalActive = signal<boolean>(false);
  selectedDate = signal<string>('');
  eventTitle = signal<string>('');
  eventColor = signal<string>('');
  selectedEvent = signal<any>(null);

  private calendarApi = signal<any>(null);

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg) => this.handleDateClick(arg),
    eventClick: (arg) => this.handleEventClick(arg),
    events: [],
  };

  constructor() {
    effect(() => {
      const events = this.calendarService.eventsSignal();
      const api = this.calendarApi();

      if (!api) return;

      api.removeAllEvents();
      events.forEach((event) => api.addEvent({ ...event, id: event._id }));
    });
  }

  ngAfterViewInit(): void {
    this.calendarApi.set(this.calendarComponent.getApi());
  }

  handleDateClick(arg: any): void {
    this.calendarModalActive.set(true);
    this.selectedDate.set(arg.dateStr);
  }

  handleEventClick(arg: any): void {
    const event = arg.event;

    this.editCalendarModalActive.set(true);
    this.selectedEvent.set(event);

    this.eventTitle.set(event.title);
    this.eventColor.set(event.backgroundColor ?? '');
    this.selectedDate.set(event.startStr);
  }

  saveEvent(): void {
    if (!this.eventTitle() || !this.eventColor() || !this.selectedDate()) return;

    this.calendarService.addEvent(this.buildEventBody());
    this.clearForm();
  }

  editEvent(): void {
    const event = this.selectedEvent();

    if (!this.eventTitle() || !this.eventColor() || !this.selectedDate()) return;
    if (!event) return;

    this.calendarService.editEvent(event.id, this.buildEventBody());
    this.clearForm();
  }

  deleteEvent(): void {
    const event = this.selectedEvent();
    if (!event) return;

    this.calendarService.deleteEvent(event.id);
    this.clearForm();
  }

  private buildEventBody(): UserEvent {
    return {
      title: this.eventTitle(),
      date: this.selectedDate(),
      color: this.eventColor(),
    };
  }

  onColorChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.eventColor.set(value);
  }

  onTitleInput(event: Event): void {
    this.eventTitle.set((event.target as HTMLInputElement).value);
  }

  private clearForm(): void {
    this.calendarModalActive.set(false);
    this.editCalendarModalActive.set(false);
    this.eventTitle.set('');
    this.eventColor.set('');
    this.selectedDate.set('');
    this.selectedEvent.set(null);
  }
}
