import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SupabaseService } from '../../services/supabase-service';
import { UserService } from '../../services/user-service';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

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
  private readonly toast = inject(ToastrService);

  readonly isLoading = signal<boolean>(false);

  readonly form = this.fb.group<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.toast.warning('Please fill in all fields correctly');
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.isLoading.set(true);

    try {
      const { error } = await this.supabase.signIn(email, password);
      if (error) throw error;

      const { data } = await this.supabase.getSession();
      if (data.session) {
        await this.supabase.loadUserRole(data.session.user.id);
      }

      const user = await firstValueFrom(this.userService.getMe());

      this.toast.success('Login successful');
      this.router.navigate([user.name ? '/' : '/post-login']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      this.toast.error(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async resetPassword(): Promise<void> {
    const email = this.form.controls.email.value;

    if (!email || this.form.controls.email.invalid) {
      this.toast.warning('Please enter a valid email address');
      return;
    }

    this.isLoading.set(true);

    try {
      const { error } = await this.supabase.resetPassword(email);
      if (error) throw error;
      this.toast.success('Check your email for the reset link');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error sending reset email';
      this.toast.error(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
