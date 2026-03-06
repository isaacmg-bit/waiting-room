import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';

@Component({
  selector: 'app-post-login',
  imports: [ReactiveFormsModule],
  templateUrl: './post-login.html',
  styleUrl: './post-login.css',
})
export class PostLogin {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  loading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    location: ['', [Validators.required, Validators.minLength(2)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading = true;

    const { name, location } = this.form.value;

    const { data } = await this.supabase.getClient().auth.getSession();
    const session = data.session;

    if (!session?.user) {
      this.loading = false;
      return;
    }

    await fetch('http://localhost:3000/users/profile-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        name,
        location,
      }),
    });

    this.loading = false;
    this.router.navigate(['/']);
  }
}
