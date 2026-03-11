import { Component, inject, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-edit-profile',
  imports: [
    NgIconComponent,
    ReactiveFormsModule,
    UserGallery,
    UserLocation,
    UserInstruments,
    UserGenres,
  ],
  providers: [provideIcons({ heroTrash, heroArrowDownTray })],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {
  private readonly userService = inject(UserService);
  private readonly cityService = inject(CityService);
  private readonly fb = inject(FormBuilder);
  private readonly uploadService = inject(UploadService);

  private currentUser: User | null = null;
  selectedCity: City | null = null;
  profilePhotoUrl = signal<string | null>(null);

  form = this.fb.group({
    name: [''],
    email: [{ value: '', disabled: true }],
    location: [null as City | null],
  });

  ngOnInit() {
    this.userService.getMe().subscribe(async (user) => {
      this.currentUser = user;
      this.form.patchValue({ name: user.name, email: user.email });

      if (user.location) {
        const city = await this.cityService.getCityCoords(user.location);
        if (city) {
          this.form.get('location')?.setValue(city);
        }
      }

      this.profilePhotoUrl.set(`${user.profile_photo_url}?t=${Date.now()}`);
    });

    this.uploadService.getGallery().subscribe({
      next: (photos) => this.uploadService.galleryPhotosSignal.set(photos),
      error: (err) => console.error('Error loading gallery photos:', err),
    });
  }

  async onProfileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const localUrl = URL.createObjectURL(input.files[0]);
    this.profilePhotoUrl.set(localUrl);

    const url = await this.uploadService.uploadProfilePhoto(input.files[0]);
    if (this.currentUser) {
      this.userService.editUser(this.currentUser.id, { profile_photo_url: url });
    }

    this.profilePhotoUrl.set(`${url}?t=${Date.now()}`);
  }

  async removeProfilePhoto(): Promise<void> {
    if (!this.currentUser) return;
    await this.uploadService.removeProfilePhoto(this.currentUser.id);
    this.userService.editUser(this.currentUser.id, { profile_photo_url: null });
    this.profilePhotoUrl.set(null);
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    const payload: Partial<User> = {
      name: this.form.value.name ?? undefined,
    };

    if (this.selectedCity) {
      payload.location = this.selectedCity.city;
      payload.location_point = `POINT(${this.selectedCity.lng} ${this.selectedCity.lat})`;
    }

    this.userService.editUser(this.currentUser.id, payload);
  }
}
