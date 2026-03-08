import { Component, inject } from '@angular/core';
import { UploadService } from '../../services/upload-service';
import { GalleryPhoto } from '../../models/GalleryPhoto';
import { firstValueFrom } from 'rxjs';
import { ApiServiceBack } from '../../services/apiservice-back';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroTrash } from '@ng-icons/heroicons/outline';
import { heroArrowDownTray } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-user-gallery',
  imports: [NgIconComponent],
  providers: [provideIcons({ heroTrash, heroArrowDownTray })],
  templateUrl: './user-gallery.html',
  styleUrl: './user-gallery.css',
})
export class UserGallery {
  selectedPhoto: string | null = null;

  readonly uploadService = inject(UploadService);
  readonly api = inject(ApiServiceBack);

  ngOnInit() {
    this.uploadService.getGallery().subscribe({
      next: (photos) => {
        this.uploadService.galleryPhotosSignal.set(photos);
      },
      error: (err) => console.error('Error loading gallery photos:', err),
    });
  }

  async onGallerySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    for (const [i, file] of files.entries()) {
      await this.uploadService.uploadGalleryPhoto(file, i + 1);
    }
  }

  openPhoto(url: string) {
    this.selectedPhoto = url;
  }

  closePhoto() {
    this.selectedPhoto = null;
  }

  async removePhoto(photo: GalleryPhoto) {
    try {
      await firstValueFrom(this.api.delete(`/gallery/${photo.id}`));
      const path = photo.url.split('/gallery/')[1];
      await this.uploadService.deleteFromStorage(path);

      this.uploadService.galleryPhotosSignal.update((photos) =>
        photos.filter((p) => p.id !== photo.id),
      );
    } catch (err) {
      console.error('Error deleting gallery photo:', err);
    }
  }
}
