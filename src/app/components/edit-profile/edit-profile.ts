import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../../services/upload-service';
import { UserGallery } from '../user-gallery/user-gallery';
import { UserLocation } from '../user-location/user-location';
import { User } from '../../models/User';
import { City } from '../../models/City';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule, UserGallery, UserLocation],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly uploadService = inject(UploadService);

  private currentUser: User | null = null;
  selectedCity: City | null = null;
  profilePhotoUrl = signal<string | null>(null);

  form = this.fb.group({
    name: [''],
    email: [{ value: '', disabled: true }],
    location: [''],
  });

  ngOnInit() {
    this.userService.getMe().subscribe((user) => {
      this.currentUser = user;
      this.form.patchValue({
        name: user.name,
        email: user.email,
        location: user.location,
      });
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

    const url = await this.uploadService.uploadProfilePhoto(input.files[0]);
    if (this.currentUser) {
      this.userService.editUser(this.currentUser.id, { profile_photo_url: url });
    }
  }

  saveProfile(): void {
    if (!this.selectedCity || !this.currentUser) return;

    const payload: Partial<User> = {
      name: this.form.value.name ?? undefined,
      location: this.selectedCity.city,
      location_point: `POINT(${this.selectedCity.lng} ${this.selectedCity.lat})`,
    };

    this.userService.editUser(this.currentUser.id, payload);
  }
}
