import { Component, inject } from '@angular/core';
import { UploadService } from '../../services/upload-service';
import { GalleryPhoto } from '../../models/GalleryPhoto';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroTrash, heroArrowDownTray } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-user-gallery',
  imports: [NgIconComponent],
  providers: [provideIcons({ heroTrash, heroArrowDownTray })],
  templateUrl: './user-gallery.html',
  styleUrl: './user-gallery.css',
})
export class UserGallery {
  readonly uploadService = inject(UploadService);

  selectedPhoto: string | null = null;
  galleryPhotos = this.uploadService.galleryPhotosSignal;

  async onGallerySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    for (const [i, file] of Array.from(input.files).entries()) {
      await this.uploadService.uploadGalleryPhoto(file, i + 1);
    }
  }

  openPhoto(url: string) {
    this.selectedPhoto = url;
  }
  closePhoto() {
    this.selectedPhoto = null;
  }

  async removePhoto(photo: GalleryPhoto): Promise<void> {
    try {
      await this.uploadService.removePhoto(photo);
    } catch (err) {
      console.error('Error deleting gallery photo:', err);
    }
  }
}
