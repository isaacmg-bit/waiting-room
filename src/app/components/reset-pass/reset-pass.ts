import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase-service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-pass',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-pass.html',
})
export class ResetPass implements OnInit {
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  password = '';

  async ngOnInit() {
    this.route.fragment.subscribe(async (fragment) => {
      if (!fragment) return;

      const params = new URLSearchParams(fragment);

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token) return;

      await this.supabase.getClient().auth.setSession({
        access_token,
        refresh_token: refresh_token || '',
      });
    });
  }

  async updatePassword() {
    if (!this.password) return;

    const { error } = await this.supabase.getClient().auth.updateUser({
      password: this.password,
    });

    if (error) {
      alert('Error updating password');
      return;
    }

    alert('Password updated');
    this.router.navigate(['/login']);
  }
}
