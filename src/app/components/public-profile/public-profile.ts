import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, finalize, combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../services/user-service';
import { UploadService } from '../../services/upload-service';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserGenresService } from '../../services/user-genres-service';
import { UserTheoryService } from '../../services/theory-service';
import { UserBandsService } from '../../services/user-bands-service';
import { User } from '../../models/User';
import { GalleryPhoto } from '../../models/GalleryPhoto';
import { UserTheory } from '../../models/UserTheory';
import { UserInstrument } from '../../models/UserInstrument';
import { UserGenre } from '../../models/UserGenre';
import { UserBand } from '../../models/UserBand';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css',
})
export class PublicProfile {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  readonly uploadService = inject(UploadService);
  private readonly userInstrumentsService = inject(UserInstrumentsService);
  private readonly userGenresService = inject(UserGenresService);
  private readonly userTheoryService = inject(UserTheoryService);
  private readonly userBandsService = inject(UserBandsService);

  readonly user = signal<User | null>(null);
  readonly galleryPhotos = signal<GalleryPhoto[]>([]);
  readonly userInstruments = signal<UserInstrument[]>([]);
  readonly userGenres = signal<UserGenre[]>([]);
  readonly userTheory = signal<UserTheory | null>(null);
  readonly userBands = signal<UserBand[]>([]);
  readonly loading = signal(true);

  readonly filteredSocialLinks = computed(() => {
    return this.user()?.social_links?.filter((l) => l.platform && l.url) ?? [];
  });

  constructor() {
    this.route.params
      .pipe(
        switchMap((params) => {
          const userId = params['userId'];
          return this.userService.getUserById(userId).pipe(
            switchMap((user) => {
              this.user.set(user);

              return combineLatest([
                this.uploadService.getGalleryByUserId(userId),
                this.userInstrumentsService.getInstrumentsByUserId(userId),
                this.userGenresService.getGenresByUserId(userId),
                this.userBandsService.getBandsByUserId(userId),
                this.userTheoryService.getTheoryByUserId(userId),
              ]);
            }),
          );
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: ([photos, instruments, genres, bands, theory]) => {
          this.galleryPhotos.set(photos);
          this.userInstruments.set(instruments);
          this.userGenres.set(genres);
          this.userBands.set(bands);
          this.userTheory.set(Array.isArray(theory) ? theory[0] : theory);
        },
        error: (err) => console.error('Error loading profile:', err),
      });
  }
}
