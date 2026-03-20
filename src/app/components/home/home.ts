import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { ChartService } from '../../services/chart-service';
@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  userService = inject(UserService);
  chartsService = inject(ChartService);
  readonly randomUsersHome = signal<any[]>([]);

  ngOnInit() {
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
