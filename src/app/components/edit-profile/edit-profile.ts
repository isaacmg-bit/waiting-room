import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../../services/upload-service';
import { firstValueFrom } from 'rxjs';
import { UserGallery } from '../user-gallery/user-gallery';
import { UserLocation } from '../user-location/user-location';
import { CityService } from '../../services/city-service';
import { SupabaseService } from '../../services/supabase-service';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule, UserGallery, UserLocation],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  readonly uploadService = inject(UploadService);
  readonly cityService = inject(CityService);
  private supabase = inject(SupabaseService)

  profilePhotoUrl = signal<string | null>(null);
  
  form = this.fb.group({
    name: [''],
    email: [{ value: '', disabled: true }],
    location: [''],
  });
  
  ngOnInit() {
    this.userService.getMe().subscribe((user) => {
      this.form.patchValue({
        name: user.name,
        email: user.email,
        location: user.location,
      });
      this.profilePhotoUrl.set(`${user.profile_photo_url}?t=${Date.now()}`);
    });

    this.uploadService.getGallery().subscribe({
      next: (photos) => {
        this.uploadService.galleryPhotosSignal.set(photos);
      },
      error: (err) => console.error('Error loading gallery photos:', err),
    });
  }

  async onProfileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const url = await this.uploadService.uploadProfilePhoto(file);
    const user = await firstValueFrom(this.userService.getMe());
    this.userService.editUser(user.id, { profile_photo_url: url });
  }

  async saveProfile(event: Event) {
    const { data } = await this.supabase.getClient().auth.getSession();
    const session = data.session;

    const cityData = this.cityService.getCityCoords(this.form.value.location);



  }
}
