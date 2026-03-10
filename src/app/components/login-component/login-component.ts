import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

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

      const user = await firstValueFrom(this.userService.getMe());
      this.router.navigate([user.name ? '/' : '/post-login']);
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

    const { error } = await this.supabase.resetPassword(email);
    if (error) {
      alert('Error sending reset email');
      return;
    }

    alert('Check your email');
  }
}
