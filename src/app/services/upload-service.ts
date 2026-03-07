import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase-service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private supabase = inject(SupabaseService).getClient();

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
}
