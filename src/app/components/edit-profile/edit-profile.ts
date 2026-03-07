import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../../services/upload-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private uploadService = inject(UploadService);

  profilePhotoUrl = signal<string | null>(null); //

  ngOnInit() {
    this.userService.getMe().subscribe((user) => {
      this.form.patchValue({
        name: user.name,
        email: user.email,
        location: user.location,
      });
      this.profilePhotoUrl.set(`${user.profile_photo_url}?t=${Date.now()}`);
    });
  }

  form = this.fb.group({
    name: [''],
    email: [{ value: '', disabled: true }],
    location: [''],
  });

  async onProfileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const url = await this.uploadService.uploadProfilePhoto(file);
    const user = await firstValueFrom(this.userService.getMe());
    this.userService.editUser(user.id, { profile_photo_url: url });
  }
}
