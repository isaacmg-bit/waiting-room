import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { GalleryPhoto } from '../models/GalleryPhoto';
import { ApiService } from './apiservice';
import { ApiServiceBack } from './apiservice-back';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private supabase = inject(SupabaseService).getClient();
  private api = inject(ApiServiceBack);

  galleryPhotosSignal = signal<GalleryPhoto[]>([]);

  async uploadProfilePhoto(file: File) {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) throw new Error('No authenticated session');

    const userId = session.user.id;
    const fileName = `${userId}/profilepicture.jpg`;

    const { data, error } = await this.supabase.storage.from('profiles').upload(fileName, file, {
      cacheControl: '0',
      upsert: true,
    });

    if (error) throw error;

    const { data: publicUrl } = this.supabase.storage.from('profiles').getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }

  async uploadGalleryPhoto(file: File, position?: number) {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session?.user) throw new Error('No authenticated session');

    const userId = session.user.id;
    const fileName = `${userId}/${Date.now()}.jpg`;

    const { data, error } = await this.supabase.storage
      .from('gallery')
      .upload(fileName, file, { cacheControl: '0', upsert: true });
    if (error) throw error;

    const { data: publicUrl } = this.supabase.storage.from('gallery').getPublicUrl(data.path);
    const url = publicUrl.publicUrl;

    const tempId = 'temp-' + Date.now();
    const photo: GalleryPhoto = { id: tempId, url, position };

    this.galleryPhotosSignal.update((photos) => [...photos, photo]);

    this.api.post<GalleryPhoto>('/gallery', { url, position }).subscribe({
      next: (createdPhoto) => {
        this.galleryPhotosSignal.update((photos) =>
          photos.filter(Boolean).map((p) => (p.id === tempId ? createdPhoto || p : p)),
        );
      },
      error: (err) => console.error('Error adding gallery photo:', err),
    });

    return url;
  }
  getGallery() {
    return this.api.get<GalleryPhoto[]>('/gallery/me');
  }

  async deleteFromStorage(path: string) {
    const { error } = await this.supabase.storage.from('gallery').remove([path]);

    if (error) throw error;
  }
}
