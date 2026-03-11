import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { UserService } from '../../services/user-service';
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
export class Header implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  isUserMenuOpen = false;

  userId = signal<string | null>(null);

  ngOnInit() {
    this.userService.getMe().subscribe((user) => this.userId.set(user.id));
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
      await this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }
}
