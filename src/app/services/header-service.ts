import { Injectable, inject, signal, effect } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { UserService } from './user-service';
import { UserProfilePicService } from './user-profilepic-service';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  readonly supabase = inject(SupabaseService);
  readonly userService = inject(UserService);
  readonly userProfilePicService = inject(UserProfilePicService);

  readonly userId = signal<string | null>(null);
  readonly userName = signal<string | null>(null);
  readonly userRole = signal<string | null>(null);
  readonly userProfilePic = signal<string | null>(null);

  constructor() {
    effect(() => {
      const currentUserId = this.supabase.userId();

      if (currentUserId) {
        this.userId.set(currentUserId);
        this.userRole.set(this.supabase.userRole());

        this.userService.getMe().subscribe((user) => {
          this.userName.set(user.name);
          const photoUrl = `${user.profile_photo_url}?t=${Date.now()}`;
          this.userProfilePicService.profilePhotoUrl.set(photoUrl);
          this.userProfilePic.set(photoUrl);
        });
      } else {
        this.userId.set(null);
        this.userName.set(null);
        this.userRole.set(null);
        this.userProfilePic.set(null);
      }
    });
  }

  async logout(): Promise<void> {
    try {
      await this.supabase.signOut();
      this.userProfilePicService.clearData();
      this.userId.set(null);
      this.userName.set(null);
      this.userRole.set(null);
      this.userProfilePic.set(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }
}
