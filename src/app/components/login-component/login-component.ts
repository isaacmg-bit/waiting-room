import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { UserService } from '../../services/user-service';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastrService);

  readonly loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.toast.warning('Please fill in all fields correctly');
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.loading.set(true);

    try {
      const { error } = await this.supabase.signIn(email!, password!);
      if (error) throw error;

      const { data } = await this.supabase.getSession();
      if (data.session) {
        await this.supabase.loadUserRole(data.session.user.id);
      }

      const user = await firstValueFrom(this.userService.getMe());
      this.toast.success('Login successful');
      this.router.navigate([user.name ? '/' : '/post-login']);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      this.toast.error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  async resetPassword(): Promise<void> {
    const email = this.form.get('email')?.value;

    if (!email) {
      this.toast.warning('Please enter your email address');
      return;
    }

    this.loading.set(true);

    try {
      const { error } = await this.supabase.resetPassword(email);
      if (error) throw error;
      this.toast.success('Check your email for the reset link');
    } catch (err) {
      console.error('Password reset error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error sending reset email';
      this.toast.error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }
}
