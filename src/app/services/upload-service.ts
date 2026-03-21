import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { ApiServiceBack } from './apiservice-back';
import { GalleryPhoto } from '../models/GalleryPhoto';
import { SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom, Observable, finalize } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase: SupabaseClient = this.supabaseService.getClient();
  private readonly api = inject(ApiServiceBack);

  readonly galleryPhotosSignal = signal<GalleryPhoto[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly selectedPhoto = signal<string | null>(null);

  readonly pendingPhotos = signal<GalleryPhoto[]>([]);
  readonly pendingDeletes = signal<GalleryPhoto[]>([]);

  private readonly BASE_URL: string = environment.apiGalleryUrl;
  private readonly ME_URL: string = `${environment.apiGalleryUrl}${environment.apiMeUrl}`;

  readonly allPhotos = computed<GalleryPhoto[]>(() => [
    ...this.galleryPhotosSignal(),
    ...this.pendingPhotos(),
  ]);

  loadGallery(): void {
    this.loadingSignal.set(true);
    this.api
      .get<GalleryPhoto[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (photos) => this.galleryPhotosSignal.set(photos),
        error: (err: unknown) => console.error('Error loading gallery:', err),
      });
  }

  async addPendingPhotos(files: FileList): Promise<void> {
    if (!files?.length) return;
    this.loadingSignal.set(true);

    try {
      const session = await this.getSession();
      await Promise.all(
        Array.from(files).map(async (file, i) => {
          const fileName = `${session.user.id}/${Date.now()}-${i}.jpg`;
          const { data, error } = await this.supabase.storage
            .from('gallery')
            .upload(fileName, file, { cacheControl: '0', upsert: true });
          if (error) throw error;

          const { data: publicUrl } = this.supabase.storage.from('gallery').getPublicUrl(data.path);
          const url = publicUrl.publicUrl;
          const tempId = `temp-${Date.now()}-${i}`;

          this.pendingPhotos.update((p) => [
            ...p,
            { id: tempId, url, position: this.allPhotos().length + 1 },
          ]);
        }),
      );
    } catch (err: unknown) {
      console.error('Error uploading to storage:', err);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  deletePhoto(photo: GalleryPhoto): void {
    if (this.isPhotoTemporary(photo.id)) {
      this.pendingPhotos.update((p) => p.filter((item) => item.id !== photo.id));
      const path = photo.url.split('/gallery/')[1];
      this.deleteFromStorage(path).catch(() => null);
      return;
    }

    this.pendingDeletes.update((list) => [...list, photo]);
    this.galleryPhotosSignal.update((list) => list.filter((p) => p.id !== photo.id));
  }

  async discardPendingPhotos(): Promise<void> {
    this.loadingSignal.set(true);

    await Promise.all(
      this.pendingPhotos().map((photo) =>
        this.deleteFromStorage(photo.url.split('/gallery/')[1]).catch(() => null),
      ),
    );

    this.galleryPhotosSignal.update((list) => [...list, ...this.pendingDeletes()]);

    this.pendingPhotos.set([]);
    this.pendingDeletes.set([]);
    this.loadingSignal.set(false);
  }

  async savePendingPhotos(): Promise<void> {
    this.loadingSignal.set(true);

    for (const photo of this.pendingPhotos()) {
      try {
        const created = await firstValueFrom(
          this.api.post<GalleryPhoto>(this.BASE_URL, { url: photo.url, position: photo.position }),
        );
        this.galleryPhotosSignal.update((p) => [...p, created]);
      } catch (err: unknown) {
        console.error('Error saving photo record:', err);
      }
    }

    for (const photo of this.pendingDeletes()) {
      try {
        await firstValueFrom(this.api.delete(`${this.BASE_URL}/${photo.id}`));
        const path = photo.url.split('/gallery/')[1];
        await this.deleteFromStorage(path);
      } catch (err: unknown) {
        console.error('Error deleting photo record:', err);
      }
    }

    this.pendingPhotos.set([]);
    this.pendingDeletes.set([]);
    this.loadingSignal.set(false);
  }

  openPhoto(url: string): void {
    this.selectedPhoto.set(url);
  }

  closePhoto(): void {
    this.selectedPhoto.set(null);
  }

  isPhotoTemporary(photoId: string): boolean {
    return photoId.startsWith('temp-');
  }

  canAddMorePhotos(): boolean {
    return this.allPhotos().length < 4;
  }

  getGallery(): Observable<GalleryPhoto[]> {
    return this.api.get<GalleryPhoto[]>(this.ME_URL);
  }

  getGalleryByUserId(userId: string): Observable<GalleryPhoto[]> {
    return this.api.get<GalleryPhoto[]>(`${this.BASE_URL}/${userId}`);
  }

  private async getSession() {
    const {
      data: { session },
    } = await this.supabaseService.getSession();
    if (!session) throw new Error('No authenticated session');
    return session;
  }

  private async deleteFromStorage(path: string): Promise<void> {
    const { error } = await this.supabase.storage.from('gallery').remove([path]);
    if (error) throw error;
  }
}
