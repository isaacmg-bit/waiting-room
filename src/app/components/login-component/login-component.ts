import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();

    try {
      this.loading = true;

      const { data, error } = await this.supabase.signIn(email!, password!);

      if (error) throw error;

      const user = data.user;

      if (user) {
        await fetch('http://localhost:3000/users/profile-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user }),
        });
      }

      this.router.navigate(['/']);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    } finally {
      this.loading = false;
    }
  }
}
