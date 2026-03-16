import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../../services/upload-service';
import { UserGallery } from '../user-gallery/user-gallery';
import { UserLocation } from '../user-location/user-location';
import { User } from '../../models/User';
import { City } from '../../models/City';
import { UserInstruments } from '../user-instruments/user-instruments';
import { CityService } from '../../services/city-service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroTrash, heroArrowDownTray } from '@ng-icons/heroicons/outline';
import { UserGenres } from '../user-genres/user-genres';
import { UserBands } from '../user-bands/user-bands';
import { ToastrService } from 'ngx-toastr';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserTheoryService } from '../../services/theory-service';
import { UserBandsService } from '../../services/user-bands-service';
import { UserGenresService } from '../../services/user-genres-service';

@Component({
  selector: 'app-edit-profile',
  imports: [
    NgIconComponent,
    ReactiveFormsModule,
    UserGallery,
    UserLocation,
    UserInstruments,
    UserGenres,
    UserBands,
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
  private readonly toast = inject(ToastrService);

  private currentUser: User | null = null;
  private initialFormValue: any;
  profilePhotoUrl = signal<string | null>(null);

  form = this.fb.group({
    name: [''],
    email: [{ value: '', disabled: true }],
    location: [null as City | null],
    bio: [''],
    gear: [''],
    rehearsal_space: [''],
  });

  constructor() {
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

      this.form.patchValue(this.initialFormValue);
      this.profilePhotoUrl.set(`${user.profile_photo_url}?t=${Date.now()}`);
      this.userInstrumentsService.loadUserInstruments();
      this.userTheoryService.loadUserTheory();
      this.userBandsService.loadUserBands();
      this.userGenresService.loadUserGenres();
      this.uploadService.getGallery().subscribe({
        next: (photos) => this.uploadService.galleryPhotosSignal.set(photos),
        error: () => this.uploadService.galleryPhotosSignal.set([]),
      });
    });
  }

  async onProfileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const localUrl = URL.createObjectURL(input.files[0]);
    this.profilePhotoUrl.set(localUrl);

    try {
      const url = await this.uploadService.uploadProfilePhoto(input.files[0]);
      if (this.currentUser) {
        this.userService.editUser(this.currentUser.id, { profile_photo_url: url });
      }
      this.profilePhotoUrl.set(`${url}?t=${Date.now()}`);
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      this.profilePhotoUrl.set(null);
    }
  }

  async removeProfilePhoto(): Promise<void> {
    if (!this.currentUser) return;

    try {
      await this.uploadService.removeProfilePhoto(this.currentUser.id);
      this.userService.editUser(this.currentUser.id, { profile_photo_url: null });
      this.profilePhotoUrl.set(null);
    } catch (err) {
      console.error('Error removing profile photo:', err);
    }
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    this.uploadService.savePendingPhotos();
    this.userInstrumentsService.savePendingInstruments();
    this.userTheoryService.saveUserTheory();
    this.userBandsService.savePendingBands();
    this.userGenresService.saveUserGenres();

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

      this.profilePhotoUrl.set(`${user.profile_photo_url}?t=${Date.now()}`);

      this.userInstrumentsService.loadUserInstruments();
      this.userTheoryService.loadUserTheory();
      this.userBandsService.loadUserBands();
      this.userGenresService.loadUserGenres();
      this.uploadService.getGallery().subscribe({
        next: (photos) => this.uploadService.galleryPhotosSignal.set(photos),
        error: () => this.uploadService.galleryPhotosSignal.set([]),
      });

      this.toast.success('Changes discarded');
    });
  }
}
