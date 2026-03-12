import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { ApiServiceBack } from './apiservice-back';
import { GalleryPhoto } from '../models/GalleryPhoto';
import { SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase: SupabaseClient = this.supabaseService.getClient();
  private readonly api = inject(ApiServiceBack);

  readonly galleryPhotosSignal = signal<GalleryPhoto[]>([]);
  readonly selectedPhoto = signal<string | null>(null);

  private async getSession() {
    const {
      data: { session },
    } = await this.supabaseService.getSession();
    if (!session) throw new Error('No authenticated session');
    return session;
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    const session = await this.getSession();
    const fileName = `${session.user.id}/profilepicture.jpg`;

    const { data, error } = await this.supabase.storage
      .from('profiles')
      .upload(fileName, file, { cacheControl: '0', upsert: true });

    if (error) throw error;

    const { data: publicUrl } = this.supabase.storage.from('profiles').getPublicUrl(data.path);
    return publicUrl.publicUrl;
  }

  async uploadGalleryPhoto(file: File, position?: number): Promise<string> {
    const session = await this.getSession();
    const fileName = `${session.user.id}/${Date.now()}.jpg`;

    const { data, error } = await this.supabase.storage
      .from('gallery')
      .upload(fileName, file, { cacheControl: '0', upsert: true });

    if (error) throw error;

    const { data: publicUrl } = this.supabase.storage.from('gallery').getPublicUrl(data.path);
    const url = publicUrl.publicUrl;

    const tempId = `temp-${Date.now()}`;
    this.galleryPhotosSignal.update((photos) => [...photos, { id: tempId, url, position }]);

    this.api.post<GalleryPhoto>('/gallery', { url, position }).subscribe({
      next: (createdPhoto) =>
        this.galleryPhotosSignal.update((photos) =>
          photos.map((p) => (p.id === tempId ? (createdPhoto ?? p) : p)),
        ),
      error: (err) => console.error('Error adding gallery photo:', err),
    });

    return url;
  }

  getGallery() {
    return this.api.get<GalleryPhoto[]>('/gallery/me');
  }

  private async deleteFromStorage(path: string): Promise<void> {
    const { error } = await this.supabase.storage.from('gallery').remove([path]);
    if (error) throw error;
  }

  async removePhoto(photo: GalleryPhoto): Promise<void> {
    try {
      await firstValueFrom(this.api.delete(`/gallery/${photo.id}`));
      const path = photo.url.split('/gallery/')[1];
      await this.deleteFromStorage(path);
      this.galleryPhotosSignal.update((photos) => photos.filter((p) => p.id !== photo.id));
    } catch (err) {
      console.error('Error deleting gallery photo:', err);
      throw err;
    }
  }

  async removeProfilePhoto(userId: string): Promise<void> {
    const fileName = `${userId}/profilepicture.jpg`;
    const { error } = await this.supabase.storage.from('profiles').remove([fileName]);
    if (error) throw error;
  }

  openPhoto(url: string): void {
    this.selectedPhoto.set(url);
  }

  closePhoto(): void {
    this.selectedPhoto.set(null);
  }

  async onGallerySelected(files: FileList): Promise<void> {
    if (!files?.length) return;

    for (const [i, file] of Array.from(files).entries()) {
      await this.uploadGalleryPhoto(file, i + 1);
    }
  }

  isPhotoTemporary(photoId: string): boolean {
    return photoId.startsWith('temp-');
  }

  canAddMorePhotos(): boolean {
    return this.galleryPhotosSignal().length < 4;
  }
}
