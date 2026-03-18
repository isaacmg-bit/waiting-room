import {
  Component,
  inject,
  viewChild,
  AfterViewInit,
  effect,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';

import { CalendarOptions } from '@fullcalendar/core';
import { CalendarService } from '../../services/calendar-service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements AfterViewInit {
  calendarComponent = viewChild<FullCalendarComponent>('calendar');
  readonly calendarService = inject(CalendarService);
  private readonly cdr = inject(ChangeDetectorRef);

  calendarTitle = signal('');
  currentView = signal('dayGridMonth');

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: false,
    displayEventTime: false,
    height: 'auto',
    aspectRatio: 2.2,
    handleWindowResize: true,
    fixedWeekCount: false,
    showNonCurrentDates: false,

    datesSet: (arg) => {
      setTimeout(() => {
        this.calendarTitle.set(arg.view.title);
        this.cdr.detectChanges();
      });
    },

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
      }));
      successCallback(events);
    },
  };

  constructor() {
    effect(() => {
      this.calendarService.userEventsSignal();
      const api = this.calendarComponent()?.getApi();
      if (api) {
        api.refetchEvents();
      }
    });
  }

  ngAfterViewInit(): void {
    this.calendarService.loadEvents();
    this.cdr.detectChanges();
  }

  prev(): void {
    this.calendarComponent()?.getApi().prev();
  }
  next(): void {
    this.calendarComponent()?.getApi().next();
  }
  today(): void {
    this.calendarComponent()?.getApi().today();
  }

  changeView(view: string): void {
    this.currentView.set(view);
    this.calendarComponent()?.getApi().changeView(view);
  }

  async saveEvent() {
    await this.calendarService.saveEvent();
  }
  async editEvent() {
    await this.calendarService.updateEvent();
  }
  async deleteEvent(id: string) {
    if (confirm('Delete?')) await this.calendarService.deleteEvent(id);
  }
  onTitleInput(e: Event) {
    this.calendarService.onTitleInput((e.target as HTMLInputElement).value);
  }
  onColorChange(e: Event) {
    this.calendarService.onColorChange((e.target as HTMLSelectElement).value);
  }
  closeModals() {
    this.calendarService.closeModals();
  }
}
