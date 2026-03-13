import { Component, inject, signal, effect } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideDrum } from '@ng-icons/lucide';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [RouterModule, NgIconComponent],
  providers: [provideIcons({ lucideDrum })],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  isUserMenuOpen = false;
  readonly userId = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.supabase.userRole();

      this.supabase.getSession().then(({ data: { session } }) => {
        if (session?.user.id) {
          this.userId.set(session.user.id);
        } else {
          this.userId.set(null);
        }
      });
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
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
