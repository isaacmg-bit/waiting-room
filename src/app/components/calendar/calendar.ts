import { Component, inject, viewChild, AfterViewInit, effect, signal, OnInit } from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { CalendarOptions, CalendarApi, EventSourceFuncArg } from '@fullcalendar/core';
import { CalendarService } from '../../services/calendar-service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { UserLocation } from '../user-location/user-location';
import { Street } from '../../models/Street';

interface CalendarForm {
  street: FormControl<Street | null>;
}

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule, UserLocation, ReactiveFormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements AfterViewInit, OnInit {
  private readonly calendarComponent = viewChild<FullCalendarComponent>('calendar');
  readonly calendarService = inject(CalendarService);
  private readonly fb = inject(FormBuilder);

  selectedStreet = signal<Street | null>(null);
  calendarTitle = signal<string>('');
  currentView = signal<string>('dayGridMonth');

  form = this.fb.group<CalendarForm>({
    street: new FormControl<Street | null>(null, { validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      this.calendarService.formattedEvents();
      const api = this.calendarApi;
      if (api) {
        api.refetchEvents();
      }
    });
  }
  
  ngOnInit(): void {
    this.form.reset();
  }

  ngAfterViewInit(): void {
    this.calendarService.loadInitialData();
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
    datesSet: (arg) => this.calendarTitle.set(arg.view.title),
    dateClick: (arg) => this.calendarService.openAddModal(arg.dateStr),
    eventClick: (arg) => {
      const originalEvent = this.calendarService
        .formattedEvents()
        .find((e) => e.id === arg.event.id);
      if (originalEvent) {
        this.calendarService.openEditModal(originalEvent.extendedProps);
      }
    },
    events: (info: EventSourceFuncArg, successCallback) =>
      successCallback(this.calendarService.formattedEvents()),
  };

  private get calendarApi(): CalendarApi | undefined {
    return this.calendarComponent()?.getApi();
  }

  prev = (): void => this.calendarApi?.prev();
  next = (): void => this.calendarApi?.next();
  today = (): void => this.calendarApi?.today();

  changeView(view: string): void {
    this.currentView.set(view);
    this.calendarApi?.changeView(view);
  }

  async saveEvent(): Promise<void> {
    await this.calendarService.saveEvent();
  }

  async editEvent(): Promise<void> {
    await this.calendarService.updateEvent();
  }

  async deleteEvent(id: string): Promise<void> {
    await this.calendarService.deleteEvent(id);
  }

  onTitleInput = (event: Event): void => {
    const value = (event.target as HTMLInputElement).value;
    this.calendarService.onTitleInput(value);
  };

  onColorChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value;
    this.calendarService.onColorChange(value);
  };

  onTypeChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value;
    this.calendarService.eventType.set(value);
  };

  onCheckboxChange = (event: Event): void => {
    const checked = (event.target as HTMLInputElement).checked;
    this.calendarService.isPublicSignal.set(checked);
  };

  closeModals = (): void => this.calendarService.closeModals();

  onStreetSelected(street: Street): void {
    this.selectedStreet.set(street);
    this.calendarService.selectedStreet.set(street);
  }
}
