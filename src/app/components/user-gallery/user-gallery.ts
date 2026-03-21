import { Component, inject, viewChild, ElementRef } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroTrash, heroArrowDownTray } from '@ng-icons/heroicons/outline';
import { UploadService } from '../../services/upload-service';
import { GalleryPhoto } from '../../models/GalleryPhoto';

@Component({
  selector: 'app-user-gallery',
  imports: [NgIconComponent],
  providers: [provideIcons({ heroTrash, heroArrowDownTray })],
  templateUrl: './user-gallery.html',
  styleUrl: './user-gallery.css',
})
export class UserGallery {
  readonly uploadService = inject(UploadService);

  readonly galleryFileInput = viewChild.required<ElementRef<HTMLInputElement>>('galleryFileInput');

  async onGallerySelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      await this.uploadService.addPendingPhotos(input.files);
      input.value = '';
    }
  }

  openPhoto(url: string): void {
    this.uploadService.openPhoto(url);
  }

  closePhoto(): void {
    this.uploadService.closePhoto();
  }

  async removePhoto(photo: GalleryPhoto): Promise<void> {
    await this.uploadService.deletePhoto(photo);
  }

  triggerFileInput(): void {
    this.galleryFileInput().nativeElement.click();
  }
}
