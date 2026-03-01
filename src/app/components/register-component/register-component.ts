import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();

    try {
      this.loading = true;

      const { error } = await this.supabase.signUp(email!, password!);

      if (error) throw error;

      alert('Check your email to verify your account');

      this.router.navigate(['/login']);
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    } finally {
      this.loading = false;
    }
  }
}
