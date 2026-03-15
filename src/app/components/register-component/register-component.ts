import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);

  readonly loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.toast.warning('Please fill in all fields correctly');
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.loading.set(true);

    try {
      const { error } = await this.supabase.signUp(email!, password!);
      if (error) throw error;

      this.toast.success('Account created! Check your email to verify');
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      this.toast.error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }
}
