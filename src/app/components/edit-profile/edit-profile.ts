import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { provideIcons } from '@ng-icons/core';
import { heroTrash, heroArrowDownTray } from '@ng-icons/heroicons/outline';

import { UserService } from '../../services/user-service';
import { CityService } from '../../services/city-service';
import { UploadService } from '../../services/upload-service';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserTheoryService } from '../../services/theory-service';
import { UserBandsService } from '../../services/user-bands-service';
import { UserGenresService } from '../../services/user-genres-service';
import { UserProfilePicService } from '../../services/user-profilepic-service';
import { UserPresenceService } from '../../services/user-presence-service';

import { UserGallery } from '../user-gallery/user-gallery';
import { UserLocation } from '../user-location/user-location';
import { UserInstruments } from '../user-instruments/user-instruments';
import { UserGenres } from '../user-genres/user-genres';
import { UserBands } from '../user-bands/user-bands';
import { UserProfilePicture } from '../user-profilepicture/user-profilepicture';
import { UserPresence } from '../user-presence/user-presence';

import { User } from '../../models/User';
import { City } from '../../models/City';
import { SocialLinkHandle } from '../../models/SocialLinkHandle';

interface ProfileForm {
  name: FormControl<string>;
  email: FormControl<string>;
  location: FormControl<City | null>;
  bio: FormControl<string>;
  gear: FormControl<string>;
  rehearsal_space: FormControl<string>;
}

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

  readonly profilePhotoUrl = this.userProfilePicService.profilePhotoUrl;
  readonly socialLinks = signal<SocialLinkHandle[]>([]);

  private currentUser: User | null = null;

  readonly form: FormGroup<ProfileForm> = this.fb.group({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(20)],
    }),
    email: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    location: new FormControl<City | null>(null),
    bio: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(150)] }),
    gear: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(150)] }),
    rehearsal_space: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
  });

  constructor() {
    this.userService
      .getMe()
      .pipe(takeUntilDestroyed())
      .subscribe((user) => this.initializeUserData(user));
  }

  private async initializeUserData(user: User): Promise<void> {
    this.currentUser = user;

    const city = user.location ? await this.cityService.getCityCoords(user.location) : null;

    this.form.patchValue({
      name: user.name,
      email: user.email,
      bio: user.bio,
      gear: user.gear,
      rehearsal_space: user.rehearsal_space,
      location: city,
    });

    this.userProfilePicService.profilePhotoUrl.set(`${user.profile_photo_url}?t=${Date.now()}`);

    this.loadAllUserData();
  }

  private loadAllUserData(): void {
    this.userInstrumentsService.loadUserInstruments();
    this.userTheoryService.loadUserTheory();
    this.userBandsService.loadUserBands();
    this.userGenresService.loadUserGenres();
    this.userPresenceService.loadUserPresence();

    this.uploadService.getGallery().subscribe({
      next: (photos) => this.uploadService.galleryPhotosSignal.set(photos),
      error: () => this.uploadService.galleryPhotosSignal.set([]),
    });
  }

  saveProfile(): void {
    if (!this.currentUser || this.form.invalid) return;

    this.uploadService.savePendingPhotos();
    this.userInstrumentsService.savePendingInstruments();
    this.userTheoryService.saveUserTheory();
    this.userBandsService.savePendingBands();
    this.userGenresService.saveUserGenres();
    this.userPresenceService.savePendingPresence();

    const formValue = this.form.getRawValue();
    const payload: Partial<User> = {
      name: formValue.name,
      bio: formValue.bio,
      gear: formValue.gear,
      rehearsal_space: formValue.rehearsal_space,
    };

    if (formValue.location) {
      payload.location = formValue.location.city;
      payload.location_point = `POINT(${formValue.location.lng} ${formValue.location.lat})`;
    }

    this.userService.editUser(this.currentUser.id, payload);
  }

  discardChanges(): void {
    this.userService.getMe().subscribe((user) => {
      this.initializeUserData(user);
      this.uploadService.discardPendingPhotos();
      this.form.markAsPristine();
      this.form.markAsUntouched();
      this.toast.success('Changes discarded');
    });
  }
}
