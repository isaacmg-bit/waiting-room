import {
  Component,
  inject,
  viewChild,
  AfterViewInit,
  effect,
  signal,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarOptions } from '@fullcalendar/core';
import { CalendarService } from '../../services/calendar-service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { UserLocation } from '../user-location/user-location';
import { Street } from '../../models/Street';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule, UserLocation, ReactiveFormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements AfterViewInit, OnInit {
  calendarComponent = viewChild<FullCalendarComponent>('calendar');

  readonly calendarService = inject(CalendarService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);

  selectedStreet: Street | null = null;
  calendarTitle = signal('');
  currentView = signal('dayGridMonth');

  form = this.fb.group({
    street: [null as any, Validators.required],
  });

  constructor() {
    effect(() => {
      this.calendarService.userEventsSignal();
      this.calendarService.userPublicEventsSignal();

      const calendar = this.calendarComponent();

      if (calendar) {
        const api = calendar.getApi();
        if (api) {
          api.refetchEvents();
        }
      }
    });
  }

  ngOnInit(): void {
    this.form.reset();
    this.selectedStreet = null;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calendarService.loadInitialData();
      this.cdr.detectChanges();
    }, 0);
  }

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
      const allEvents = [
        ...this.calendarService.userEventsSignal(),
        ...this.calendarService.userPublicEventsSignal(),
      ];
      const originalEvent = allEvents.find((e) => e.id === arg.event.id);
      if (originalEvent) this.calendarService.openEditModal(originalEvent);
    },
    events: (info, successCallback) => {
      const myEvents = this.calendarService.userEventsSignal();
      const publicEvents = this.calendarService.userPublicEventsSignal();
      const combinedMap = new Map();

      publicEvents.forEach((e) => {
        combinedMap.set(e.id, { ...e, displayTitle: `🌍 ${e.title}`, isMine: false });
      });

      myEvents.forEach((e) => {
        combinedMap.set(e.id, { ...e, displayTitle: e.title, isMine: true });
      });

      const formatted = Array.from(combinedMap.values()).map((event) => ({
        id: event.id,
        title: event.displayTitle,
        start: event.event_date,
        backgroundColor: this.calendarService.getColorCode(event.color),
        borderColor: this.calendarService.getColorCode(event.color),
        classNames: event.isMine ? [] : ['public-event-style'],
        extendedProps: { ...event },
      }));

      successCallback(formatted);
    },
  };

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
    if (confirm('¿Eliminar evento?')) await this.calendarService.deleteEvent(id);
  }

  onTitleInput(e: Event) {
    this.calendarService.onTitleInput((e.target as HTMLInputElement).value);
  }

  onColorChange(e: Event) {
    this.calendarService.onColorChange((e.target as HTMLSelectElement).value);
  }

  onTypeChange(e: Event) {
    this.calendarService.eventType.set((e.target as HTMLSelectElement).value);
  }

  onCheckboxChange(e: Event) {
    this.calendarService.isPublicSignal.set((e.target as HTMLInputElement).checked);
  }

  closeModals() {
    this.calendarService.closeModals();
  }

  onStreetSelected(street: Street): void {
    this.selectedStreet = street;
    this.calendarService.selectedStreet.set(street);
  }
}
