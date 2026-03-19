import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadService } from '../../services/upload-service';
import { UserGallery } from '../user-gallery/user-gallery';
import { UserLocation } from '../user-location/user-location';
import { User } from '../../models/User';
import { City } from '../../models/City';
import { UserInstruments } from '../user-instruments/user-instruments';
import { CityService } from '../../services/city-service';
import { provideIcons } from '@ng-icons/core';
import { heroTrash, heroArrowDownTray } from '@ng-icons/heroicons/outline';
import { UserGenres } from '../user-genres/user-genres';
import { UserBands } from '../user-bands/user-bands';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserTheoryService } from '../../services/theory-service';
import { UserBandsService } from '../../services/user-bands-service';
import { UserGenresService } from '../../services/user-genres-service';
import { UserProfilePicService } from '../../services/user-profilepic-service';
import { UserProfilePicture } from '../user-profilepicture/user-profilepicture';
import { UserPresence } from '../user-presence/user-presence';
import { UserPresenceService } from '../../services/user-presence-service';
import { SocialLinkHandle } from '../../models/SocialLinkHandle';

@Component({
  selector: 'app-edit-profile',
  imports: [
    ReactiveFormsModule,
    UserGallery,
    UserLocation,
    UserInstruments,
    UserGenres,
    UserBands,
    UserProfilePicture,
    UserPresence,
  ],
  providers: [provideIcons({ heroTrash, heroArrowDownTray })],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  private readonly userService = inject(UserService);
  private readonly cityService = inject(CityService);
  private readonly fb = inject(FormBuilder);
  private readonly uploadService = inject(UploadService);
  private readonly userInstrumentsService = inject(UserInstrumentsService);
  private readonly userTheoryService = inject(UserTheoryService);
  private readonly userBandsService = inject(UserBandsService);
  private readonly userGenresService = inject(UserGenresService);
  private readonly userProfilePicService = inject(UserProfilePicService);
  private readonly userPresenceService = inject(UserPresenceService);
  private readonly toast = inject(ToastrService);

  profilePhotoUrl = this.userProfilePicService.profilePhotoUrl;
  private currentUser: User | null = null;
  private initialFormValue: any;
  socialLinks: SocialLinkHandle[] = [];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    email: [{ value: '', disabled: true }],
    location: [null as City | null],
    bio: ['', [Validators.maxLength(150)]],
    gear: ['', [Validators.maxLength(150)]],
    rehearsal_space: ['', [Validators.maxLength(150)]],
  });

  constructor() {
    this.userService
      .getMe()
      .pipe(takeUntilDestroyed())
      .subscribe(async (user) => {
        this.currentUser = user;

        const city = user.location ? await this.cityService.getCityCoords(user.location) : null;

        this.initialFormValue = {
          name: user.name,
          email: user.email,
          bio: user.bio,
          gear: user.gear,
          rehearsal_space: user.rehearsal_space,
          location: city,
        };

        this.form.patchValue(this.initialFormValue);

        this.userProfilePicService.profilePhotoUrl.set(`${user.profile_photo_url}?t=${Date.now()}`);

        this.userInstrumentsService.loadUserInstruments();
        this.userTheoryService.loadUserTheory();
        this.userBandsService.loadUserBands();
        this.userGenresService.loadUserGenres();
        this.userPresenceService.loadUserPresence();
        this.uploadService.getGallery().subscribe({
          next: (photos) => this.uploadService.galleryPhotosSignal.set(photos),
          error: () => this.uploadService.galleryPhotosSignal.set([]),
        });
      });
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    this.uploadService.savePendingPhotos();
    this.userInstrumentsService.savePendingInstruments();
    this.userTheoryService.saveUserTheory();
    this.userBandsService.savePendingBands();
    this.userGenresService.saveUserGenres();
    this.userPresenceService.savePendingPresence();

    const payload: Partial<User> = {
      name: this.form.value.name ?? undefined,
      bio: this.form.value.bio ?? undefined,
      gear: this.form.value.gear ?? undefined,
      rehearsal_space: this.form.value.rehearsal_space ?? undefined,
    };

    const city: City | null = this.form.value.location ?? null;

    if (city) {
      payload.location = city.city;
      payload.location_point = `POINT(${city.lng} ${city.lat})`;
    }

    this.userService.editUser(this.currentUser.id, payload);
  }

  discardChanges(): void {
    this.userService.getMe().subscribe(async (user) => {
      this.currentUser = user;

      const city = user.location ? await this.cityService.getCityCoords(user.location) : null;

      this.initialFormValue = {
        name: user.name,
        email: user.email,
        bio: user.bio,
        gear: user.gear,
        rehearsal_space: user.rehearsal_space,
        location: city,
      };

      this.form.reset(this.initialFormValue);
      this.form.markAsPristine();
      this.form.markAsUntouched();

      this.userProfilePicService.profilePhotoUrl.set(`${user.profile_photo_url}?t=${Date.now()}`);

      this.userInstrumentsService.loadUserInstruments();
      this.userTheoryService.loadUserTheory();
      this.userBandsService.loadUserBands();
      this.userGenresService.loadUserGenres();
      this.userPresenceService.loadUserPresence();
      this.uploadService.discardPendingPhotos();
      this.uploadService.getGallery().subscribe({
        next: (photos) => this.uploadService.galleryPhotosSignal.set(photos),
        error: () => this.uploadService.galleryPhotosSignal.set([]),
      });

      this.toast.success('Changes discarded');
    });
  }
}
