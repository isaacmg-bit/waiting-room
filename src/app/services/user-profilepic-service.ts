import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase-service';
import { UserService } from './user-service';
import { User } from '../models/User';

@Injectable({ providedIn: 'root' })
export class UserProfilePicService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase: SupabaseClient = this.supabaseService.getClient();
  private readonly userService = inject(UserService);

  profilePhotoUrl = signal<string | null>(null);
  private currentUser: User | null = null;
  private readonly profilePicUrl = '/profilepicture.jpg';

  constructor() {
    this.init();
  }

  private async getSession() {
    const {
      data: { session },
    } = await this.supabaseService.getSession();
    if (!session) throw new Error('No authenticated session');
    return session;
  }
  
  private async init() {
    const session = await this.getSession().catch(() => null);

    if (!session) return;

    this.userService.getMe().subscribe((user) => {
      this.currentUser = user;

      if (user.profile_photo_url) {
        this.profilePhotoUrl.set(`${user.profile_photo_url}?t=${Date.now()}`);
      } else {
        this.profilePhotoUrl.set(null);
      }
    });
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    if (!this.currentUser) throw new Error('No current user');

    const fileName = `${this.currentUser.id}/profilepicture.jpg`;

    const { error } = await this.supabase.storage
      .from('profiles')
      .upload(fileName, file, { cacheControl: '0', upsert: true });

    if (error) throw error;

    const { data: publicUrlData } = this.supabase.storage.from('profiles').getPublicUrl(fileName);

    const url = publicUrlData.publicUrl;

    this.userService.editUser(this.currentUser.id, { profile_photo_url: url });

    this.profilePhotoUrl.set(`${url}?t=${Date.now()}`);

    return url;
  }

  async removeProfilePhoto(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const fileName = `${this.currentUser.id}/profilepicture.jpg`;
      const { error } = await this.supabase.storage.from('profiles').remove([fileName]);
      if (error) throw error;

      this.userService.editUser(this.currentUser.id, { profile_photo_url: null });
      this.profilePhotoUrl.set(null);
    } catch (err) {
      console.error('Error removing profile photo:', err);
    }
  }
}
