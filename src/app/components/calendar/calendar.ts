import { Component, signal, inject, ViewChild, effect, AfterViewInit } from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import { CalendarService } from '../../services/calendar-service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

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
  selectedEvent = signal<any | null>(null);

  private calendarApi: any = null;

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
      const api = this.calendarApi;

      if (!api) return;

      api.removeAllEvents();
      events.forEach((event) => api.addEvent({ ...event, id: event._id }));
    });
  }

  ngAfterViewInit() {
    this.calendarApi = this.calendarComponent.getApi();
    this.calendarService.eventsSignal().forEach((event) => {
      this.calendarApi!.addEvent(event);
    });
  }

  handleDateClick(arg: any) {
    this.calendarModalActive.set(true);
    this.selectedDate.set(arg.dateStr);
  }

  handleEventClick(arg: any) {
    const event = arg.event;

    this.editCalendarModalActive.set(true);
    this.selectedEvent.set(event);

    this.eventTitle.set(event.title);
    this.eventColor.set(event.backgroundColor ?? '');
    this.selectedDate.set(event.startStr);
  }

  saveEvent() {
    if (!this.eventTitle() || !this.eventColor()) return;

    this.calendarService.addEvent(this.buildEventBody());
    this.closeModal();
  }

  editEvent() {
    const event = this.selectedEvent();

    if (!this.eventTitle() || !this.eventColor()) return;
    if (!event) return;

    this.calendarService.editEvent(event.id, this.buildEventBody());
    this.closeEditModal();
  }

  deleteEvent() {
    const event = this.selectedEvent();
    if (!event) return;

    this.calendarService.deleteEvent(event.id);
    this.closeEditModal();
  }

  closeModal() {
    this.calendarModalActive.set(false);
    this.cleanSignals();
  }

  closeEditModal() {
    this.editCalendarModalActive.set(false);
    this.cleanSignals();
  }

  private buildEventBody() {
    return {
      title: this.eventTitle(),
      date: this.selectedDate(),
      color: this.eventColor(),
    };
  }

  private cleanSignals() {
    this.eventTitle.set('');
    this.eventColor.set('');
  }

  onColorChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.eventColor.set(value);
  }

  onTitleInput(event: Event): void {
    this.eventTitle.set((event.target as HTMLInputElement).value);
  }
}
