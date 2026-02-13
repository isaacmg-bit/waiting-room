import { Component, signal, inject, ViewChild, effect } from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import { CalendarService } from '../../services/calendar-service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Events } from 'leaflet';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
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
      if (!this.calendarApi) return;
      this.calendarApi.removeAllEvents();
      events.forEach((event) => this.calendarApi.addEvent({ ...event, id: event._id }));
    });
  }

  ngAfterViewInit() {
    this.calendarApi = this.calendarComponent.getApi();
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
    this.eventColor.set(event.backgroundColor || event.color);
    this.selectedDate.set(event.startStr);
  }

  saveEvent() {
    if (!this.eventTitle() || !this.eventColor()) return;

    const newEventBody = {
      title: this.eventTitle(),
      date: this.selectedDate(),
      color: this.eventColor(),
    };
    this.calendarService.addEvent(newEventBody);
    this.closeModal();
  }

  editEvent() {
    const event = this.selectedEvent();
    if (!this.eventTitle() || !this.eventColor()) return;
    if (!event) return;

    const _id = event.id;

    const editedEventBody = {
      title: this.eventTitle(),
      date: this.selectedDate(),
      color: this.eventColor(),
    };

    this.calendarService.editEvent(_id, editedEventBody);
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
  }
  
  closeEditModal() {
    this.editCalendarModalActive.set(false);
  }
}
