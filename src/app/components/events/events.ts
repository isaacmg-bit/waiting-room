import { Component, inject } from '@angular/core';
import { Calendar } from '../calendar/calendar';
import { Map } from '../map/map';
import { Charts } from '../charts/charts';
import { CalendarService } from '../../services/calendar-service';

@Component({
  selector: 'app-events',
  imports: [Calendar, Map, Charts],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events {
  readonly calendarService = inject(CalendarService);

  monthToString(monthNum: string): string {
    const months: Record<string, string> = {
      '01': 'JAN',
      '02': 'FEB',
      '03': 'MAR',
      '04': 'APR',
      '05': 'MAY',
      '06': 'JUN',
      '07': 'JUL',
      '08': 'AUG',
      '09': 'SEP',
      '10': 'OCT',
      '11': 'NOV',
      '12': 'DEC',
    };

    return months[monthNum] ?? '';
  }
}
