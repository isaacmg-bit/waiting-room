import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private supabase = inject(SupabaseService);

  async logout() {
    await this.supabase.signOut();
  }
}
