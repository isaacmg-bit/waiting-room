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

      const { error } = await this.supabase.signIn(email!, password!);

      if (error) throw error;

      this.router.navigate(['/home']);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    } finally {
      this.loading = false;
    }
  }

  async resetPassword() {
    const email = this.form.value.email;

    if (!email) {
      alert('Enter email first');
      return;
    }

    const { error } = await this.supabase.getClient().auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:4200/reset-pass',
    });

    if (error) {
      alert('Error sending reset email');
      return;
    }

    alert('Check your email');
  }
}
