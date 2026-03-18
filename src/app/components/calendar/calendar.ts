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
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CalendarOptions } from '@fullcalendar/core';
import { CalendarService } from '../../services/calendar-service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { UserLocation } from '../user-location/user-location';
import { Validators } from '@angular/forms';
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

  ngOnInit(): void {
    this.form.reset();
    this.selectedStreet = null;
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

  onTypeChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.calendarService.eventType.set(val);
  }

  onCheckboxChange(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.calendarService.isPublicSignal.set(checked);
  }

  closeModals() {
    this.calendarService.closeModals();
  }

  onStreetSelected(street: Street): void {
    this.selectedStreet = street;
    this.calendarService.selectedStreet.set(street);
    console.log(street)
  }
}
