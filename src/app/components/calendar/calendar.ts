import { Component, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  calendarModalActive = signal<boolean>(false);
  selectedDate = signal<string>('');
  eventTitle = signal<string>('');
  eventColor = signal<string>('');
  events = signal<{ title: string; date: string }[]>([]);

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg) => this.handleDateClick(arg),
    events: [],
  };

  handleDateClick(arg: any) {
    this.calendarModalActive.set(true);
    this.selectedDate.set(arg.dateStr);
  }

  saveEvent() {
    const newEvent = {
      title: this.eventTitle(),
      date: this.selectedDate(),
      color: this.eventColor(),
    };
    this.events.update((events) => [...events, newEvent]);
    this.calendarOptions.events = this.events();
    this.closeModal();
  }

  closeModal() {
    this.calendarModalActive.set(false);
  }
}
