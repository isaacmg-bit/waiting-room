import { Component, inject, viewChild, ElementRef } from '@angular/core';
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

  galleryFileInput = viewChild.required<ElementRef<HTMLInputElement>>('galleryFileInput');

  async onGallerySelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    await this.uploadService.onGallerySelected(input.files || new FileList());
  }

  openPhoto(url: string): void {
    this.uploadService.openPhoto(url);
  }

  closePhoto(): void {
    this.uploadService.closePhoto();
  }

  async removePhoto(photo: GalleryPhoto): Promise<void> {
    await this.uploadService.removePhoto(photo);
  }

  triggerFileInput(): void {
    this.galleryFileInput().nativeElement.click();
  }
}
