import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { ChartService } from '../../services/chart-service';
import { CalendarService } from '../../services/calendar-service';
import { UserSearchService } from '../../services/user-search-service';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserGenresService } from '../../services/user-genres-service';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  userService = inject(UserService);
  chartsService = inject(ChartService);
  calendarService = inject(CalendarService);
  readonly userSearchService = inject(UserSearchService);
  readonly userInstrumentService = inject(UserInstrumentsService);
  readonly userGenresService = inject(UserGenresService);

  readonly randomUsersHome = signal<any[]>([]);

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

    return months[monthNum];
  }
  ngOnInit() {
    this.calendarService.loadPublicEvents();
    this.chartsService.fetchTotalUsers();
    this.userService.getRandomUsers().subscribe((results) => {
      const transformed = results.map((user: any) => ({
        ...user,
        instruments: user.instruments ? user.instruments.split(', ') : [],
        genres: user.genres ? user.genres.split(', ') : [],
        bands: user.bands ? user.bands.split(', ') : [],
        pics: user.profile_photo_url ? user.profile_photo_url.split(',') : [],
      }));
      this.randomUsersHome.set(transformed);
      console.log(transformed);
    });
  }
}
