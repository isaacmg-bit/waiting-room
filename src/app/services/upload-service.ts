import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { ApiServiceBack } from './apiservice-back';
import { GalleryPhoto } from '../models/GalleryPhoto';
import { SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase: SupabaseClient = this.supabaseService.getClient();
  private readonly api = inject(ApiServiceBack);

  readonly galleryPhotosSignal = signal<GalleryPhoto[]>([]);
  readonly selectedPhoto = signal<string | null>(null);
  readonly pendingPhotos = signal<GalleryPhoto[]>([]);

  private readonly BASE_URL = environment.apiGalleryUrl;


  readonly allPhotos = computed(() => [...this.galleryPhotosSignal(), ...this.pendingPhotos()]);
  
  private async getSession() {
    const {
      data: { session },
    } = await this.supabaseService.getSession();
    if (!session) throw new Error('No authenticated session');
    return session;
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
    this.pendingPhotos.update((p) => [...p, { id: tempId, url, position }]);
    return url;
  }

  async savePendingPhotos(): Promise<void> {
    for (const photo of this.pendingPhotos()) {
      const created = await firstValueFrom(
        this.api.post<GalleryPhoto>('/gallery', { url: photo.url, position: photo.position }),
      );
      this.galleryPhotosSignal.update((p) => [...p, created]);
    }
    this.pendingPhotos.set([]);
  }

  async discardPendingPhotos(): Promise<void> {
    await Promise.all(
      this.pendingPhotos().map((photo) =>
        this.deleteFromStorage(photo.url.split('/gallery/')[1]).catch(() => null),
      ),
    );
    this.pendingPhotos.set([]);
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

  openPhoto(url: string): void {
    this.selectedPhoto.set(url);
  }

  closePhoto(): void {
    this.selectedPhoto.set(null);
  }

  async onGallerySelected(files: FileList): Promise<void> {
    if (!files?.length) return;

    await Promise.all(Array.from(files).map((file, i) => this.uploadGalleryPhoto(file, i + 1)));
  }

  getGalleryByUserId(userId: string) {
    return this.api.get<GalleryPhoto[]>(`${this.BASE_URL}/${userId}`);
  }

  isPhotoTemporary(photoId: string): boolean {
    return photoId.startsWith('temp-');
  }

  canAddMorePhotos(): boolean {
    return this.allPhotos().length < 4;
  }

  
}
