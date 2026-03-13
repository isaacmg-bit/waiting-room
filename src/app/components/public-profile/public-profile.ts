import { Component, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user-service';
import { User } from '../../models/User';
import { signal } from '@angular/core';
import { TitleCasePipe, NgClass } from '@angular/common';
import { UploadService } from '../../services/upload-service';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserGenresService } from '../../services/user-genres-service';
import { UserTheoryService } from '../../services/theory-service';
import { UserBandsService } from '../../services/user-bands';
import { GalleryPhoto } from '../../models/GalleryPhoto';
import { UserTheory } from '../../models/UserTheory';
import { UserInstrument } from '../../models/UserInstrument';
import { UserGenre } from '../../models/UserGenre';
import { UserBand } from '../../models/UserBand';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css',
  imports: [TitleCasePipe, NgClass],
})
export class PublicProfile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly uploadService = inject(UploadService);
  private readonly userInstrumentsService = inject(UserInstrumentsService);
  private readonly userGenresService = inject(UserGenresService);
  private readonly userTheoryService = inject(UserTheoryService);
  private readonly userBandsService = inject(UserBandsService);

  user = signal<User | null>(null);
  galleryPhotos = signal<GalleryPhoto[]>([]);
  userInstruments = signal<UserInstrument[]>([]);
  userGenres = signal<UserGenre[]>([]);
  userTheory = signal<UserTheory | null>(null);
  userBands = signal<UserBand[]>([]);

  loading = signal(true);

  filteredSocialLinks = computed(() => {
    return this.user()?.social_links?.filter((l) => l.platform && l.url) ?? [];
  });

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const userId = params['userId'];

      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.user.set(user);
          this.uploadService.getGalleryByUserId(userId).subscribe({
            next: (photos) => {
              this.galleryPhotos.set(photos);
              this.loading.set(false);
            },
            error: (err) => console.error('Error loading gallery:', err),
          });
          this.userInstrumentsService.getInstrumentsByUserId(userId).subscribe({
            next: (instruments) => {
              this.userInstruments.set(instruments);
              this.loading.set(false);
            },
            error: (err) => console.error('Error loading instruments:', err),
          });
          this.userGenresService.getGenresByUserId(userId).subscribe({
            next: (genres) => {
              this.userGenres.set(genres);
              this.loading.set(false);
            },
            error: (err) => console.error('Error loading genres:', err),
          });
          this.userBandsService.getBandsByUserId(userId).subscribe({
            next: (bands) => {
              this.userBands.set(bands);
              this.loading.set(false);
            },
            error: (err) => console.error('Error loading bands:', err),
          });
          this.userTheoryService.getTheoryByUserId(userId).subscribe({
            next: (theory) => {
              this.userTheory.set(Array.isArray(theory) ? theory[0] : theory);
              this.loading.set(false);
            },
            error: (err) => console.error('Error loading theory:', err),
          });
        },
        error: (err) => console.error('Error:', err),
      });
    });
  }
}
