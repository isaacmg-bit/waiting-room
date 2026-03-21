import { Injectable, inject, signal, effect } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { UserService } from './user-service';
import { UserProfilePicService } from './user-profilepic-service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  readonly supabase = inject(SupabaseService);
  readonly userService = inject(UserService);
  readonly userProfilePicService = inject(UserProfilePicService);
  readonly router = inject(Router);

  readonly userId = signal<string | null>(null);
  readonly userName = signal<string | null>(null);
  readonly userRole = signal<string | null>(null);
  readonly userProfilePic = signal<string | null>(null);

  constructor() {
    this.supabase.getClient().auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        this.userId.set(session.user.id);

        this.userService.getMe().subscribe({
          next: (user) => {
            this.userName.set(user.name);
            const photoUrl = `${user.profile_photo_url}?t=${Date.now()}`;
            this.userProfilePic.set(photoUrl);
            this.userProfilePicService.profilePhotoUrl.set(photoUrl);
          },
        });
      } else {
        this.userId.set(null);
        this.userName.set(null);
        this.userProfilePic.set(null);
      }
    });
  }

  private resetSignals() {
    this.userId.set(null);
    this.userName.set(null);
    this.userRole.set(null);
    this.userProfilePic.set(null);
  }

  async logout(): Promise<void> {
    await this.supabase.signOut();
    this.resetSignals();
    this.router.navigate(['/login']);
  }
}
