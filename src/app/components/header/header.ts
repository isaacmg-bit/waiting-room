import { Component, inject, signal, effect } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideDrum } from '@ng-icons/lucide';
import { UserService } from '../../services/user-service';
import { UserProfilePicService } from '../../services/user-profilepic-service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, NgIconComponent],
  providers: [provideIcons({ lucideDrum })],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly supabase = inject(SupabaseService);
  readonly userService = inject(UserService);
  private readonly router = inject(Router);
  readonly userProfilePicService = inject(UserProfilePicService);

  isUserMenuOpen = signal(false);
  readonly userId = signal<string | null>(null);
  readonly userName = signal<string | null>(null);
  readonly userRole = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.supabase.userRole();

      this.supabase.getSession().then(({ data: { session } }) => {
        if (session?.user.id) {
          this.userId.set(session.user.id);
          this.supabase.loadUserRole(this.userId()!);
          this.userRole.set(this.userId());

          this.userService.getMe().subscribe((user) => {
            this.userName.set(user.name);
          });
        } else {
          this.userId.set(null);
          this.userName.set(null);
        }
      });
    });
  }

  async logout(): Promise<void> {
    try {
      await this.supabase.signOut();
      this.userId.set(null);
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }
}
