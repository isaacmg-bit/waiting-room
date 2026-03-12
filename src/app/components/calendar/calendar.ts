// calendar.component.ts
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
export class Calendar implements AfterViewInit, OnDestroy {
  calendarComponent = viewChild<FullCalendarComponent>('calendar');
  readonly calendarService = inject(CalendarService);

  private calendarApi: any = null;
  private readonly apiReady = signal(false);

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    displayEventTime: false,
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg) => this.calendarService.openAddModal(arg.dateStr),
    eventClick: (arg) => this.calendarService.openEditModal(arg.event),
    events: (info, successCallback) => {
      const events = this.calendarService.eventsSignal();
      const formattedEvents = events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.date,
        backgroundColor: this.calendarService.getColorCode(event.color),
        borderColor: this.calendarService.getColorCode(event.color),
      }));
      successCallback(formattedEvents);
    },
  };

  constructor() {
    effect(() => {
      if (!this.apiReady()) return;
      this.calendarService.eventsSignal();
      this.calendarApi?.refetchEvents();
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

  saveEvent(): void {
    this.calendarService.saveEvent();
  }

  editEvent(): void {
    this.calendarService.saveEditedEvent();
  }

  deleteEvent(): void {
    this.calendarService.deleteSelectedEvent();
  }

  onTitleInput(event: Event): void {
    this.calendarService.onTitleInput((event.target as HTMLInputElement).value);
  }

  onColorChange(event: Event): void {
    this.calendarService.onColorChange((event.target as HTMLSelectElement).value);
  }

  closeModals(): void {
    this.calendarService.closeModals();
  }
}
