import { Component, OnInit, inject } from '@angular/core';
import { SupabaseService } from './services/supabase-service';
import { Header } from './components/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, RouterOutlet],
  templateUrl: './app.html',
})
export class AppComponent implements OnInit {
  private supabase = inject(SupabaseService);

  ngOnInit() {
    this.supabase.getClient().auth.onAuthStateChange(async (_, session) => {
      if (!session?.user) return;

      if (!session.user.email_confirmed_at) return;

      await fetch('http://localhost:3000/users/profile-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: session.user.id,
          email: session.user.email,
        }),
      });
    });
  }
}
