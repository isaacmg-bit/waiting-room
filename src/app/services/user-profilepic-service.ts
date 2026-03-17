import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { UserService } from './user-service';
import { User } from '../models/User';
import { environment } from '../../environments/environment';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class UserProfilePicService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly userService = inject(UserService);

  private readonly supabase: SupabaseClient = this.supabaseService.getClient();

  readonly profilePhotoUrl = signal<string | null>(null);
  readonly loadingSignal = signal<boolean>(false);

  private readonly currentUser = signal<User | null>(null);
  private readonly PIC_URL_SUFFIX: string = environment.profilePicUrl;

  constructor() {
    this.loadProfilePhoto();
  }

  loadProfilePhoto(): void {
    this.loadingSignal.set(true);

    this.userService.getMe().subscribe({
      next: (user: User) => {
        this.currentUser.set(user);
        this.updateLocalUrl(user.profile_photo_url);
        this.loadingSignal.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading profile photo:', err);
        this.loadingSignal.set(false);
      },
    });
  }

  async uploadProfilePhoto(file: File): Promise<string | void> {
    const user = this.currentUser();
    if (!user) return;

    this.loadingSignal.set(true);
    const fileName = `${user.id}${this.PIC_URL_SUFFIX}`;

    try {
      const { error } = await this.supabase.storage
        .from('profiles')
        .upload(fileName, file, { cacheControl: '0', upsert: true });

      if (error) throw error;

      const { data } = this.supabase.storage.from('profiles').getPublicUrl(fileName);
      const url: string = data.publicUrl;

      this.userService.editUser(user.id, { profile_photo_url: url });
      this.updateLocalUrl(url);

      return url;
    } catch (err: unknown) {
      console.error('Error uploading photo:', err);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteProfilePhoto(): Promise<void> {
    const user = this.currentUser();
    if (!user) return;

    this.loadingSignal.set(true);
    const fileName = `${user.id}${this.PIC_URL_SUFFIX}`;

    try {
      const { error } = await this.supabase.storage.from('profiles').remove([fileName]);
      if (error) throw error;

      this.userService.editUser(user.id, { profile_photo_url: null });
      this.profilePhotoUrl.set(null);
    } catch (err: unknown) {
      console.error('Error removing photo:', err);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  clearData(): void {
    this.profilePhotoUrl.set(null);
    this.currentUser.set(null);
  }

  private updateLocalUrl(url: string | null | undefined): void {
    this.profilePhotoUrl.set(url ? `${url}?t=${Date.now()}` : null);
  }
}
