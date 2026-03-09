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
  private readonly supabase = inject(SupabaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  password = '';

  ngOnInit() {
    const fragment = this.route.snapshot.fragment;
    if (!fragment) return;

    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token) return;

    this.supabase.setSession(access_token, refresh_token ?? '');
  }

  async updatePassword(): Promise<void> {
    if (!this.password) return;

    const { error } = await this.supabase.updatePassword(this.password);

    if (error) {
      alert(`Error updating password: ${error.message}`);
      return;
    }

    alert('Password updated');
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
