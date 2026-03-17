import { Component, inject } from '@angular/core';
import { UserProfilePicService } from '../../services/user-profilepic-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroTrash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-user-profilepicture',
  imports: [NgIcon],
  providers: [provideIcons({ heroTrash })],
  templateUrl: './user-profilepicture.html',
  styleUrls: ['./user-profilepicture.css'],
})
export class UserProfilePicture {
  profilePicService = inject(UserProfilePicService);

  async onProfileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const localUrl = URL.createObjectURL(input.files[0]);
    this.profilePicService.profilePhotoUrl.set(localUrl);

    try {
      await this.profilePicService.uploadProfilePhoto(input.files[0]);
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      this.profilePicService.profilePhotoUrl.set(null);
    }
  }

  async removeProfilePhoto(): Promise<void> {
    try {
      await this.profilePicService.removeProfilePhoto();
    } catch (err) {
      console.error('Error removing profile photo:', err);
    }
  }

  get hasRealPhoto(): boolean {
    const url = this.profilePicService.profilePhotoUrl();
    return !!url && !/null\?t=\d{13}$/.test(url);
  }
}
