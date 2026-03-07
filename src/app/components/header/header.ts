import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private supabase = inject(SupabaseService);
  private userService = inject(UserService);
  userId = signal<string | null>(null);

  async logout() {
    await this.supabase.signOut();
  }

  ngOnInit() {
    this.userService.getMe().subscribe((user) => {
      this.userId.set(user.id);
    });
  }
}
