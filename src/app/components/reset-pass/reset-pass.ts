import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';

@Component({
  selector: 'app-reset-pass',
  imports: [FormsModule],
  templateUrl: './reset-pass.html',
})
export class ResetPass implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  password = '';

  ngOnInit(): void {
    const fragment = this.route.snapshot.fragment;
    this.supabase.setSessionFromFragment(fragment);
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
