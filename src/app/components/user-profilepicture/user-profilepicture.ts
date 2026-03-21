import { Component, inject, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroTrash } from '@ng-icons/heroicons/outline';
import { UserProfilePicService } from '../../services/user-profilepic-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-profilepicture',
  imports: [NgIcon],
  providers: [provideIcons({ heroTrash })],
  templateUrl: './user-profilepicture.html',
  styleUrls: ['./user-profilepicture.css'],
})
export class UserProfilePicture {
  protected readonly profilePicService = inject(UserProfilePicService);
  private readonly toast = inject(ToastrService);

  readonly hasRealPhoto = computed(() => {
    const url = this.profilePicService.profilePhotoUrl();
    if (!url) return false;
    return !/null\?t=\d{13}$/.test(url);
  });

  async onProfileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    const previousUrl = this.profilePicService.profilePhotoUrl();
    this.profilePicService.profilePhotoUrl.set(localUrl);

    try {
      await this.profilePicService.uploadProfilePhoto(file);
    } catch (error) {
      this.toast.error('Error uploading profile picture');
      this.profilePicService.profilePhotoUrl.set(previousUrl);
    } finally {
      URL.revokeObjectURL(localUrl);
      input.value = '';
    }
  }

  async removeProfilePhoto(): Promise<void> {
    try {
      await this.profilePicService.deleteProfilePhoto();
    } catch (error) {
      console.error(error);
    }
  }
}
