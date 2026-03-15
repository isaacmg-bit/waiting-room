import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';

@Component({
  selector: 'app-reset-pass',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-pass.html',
})
export class ResetPass implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  passwordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const fragment = this.route.snapshot.fragment;
    this.supabase.setSessionFromFragment(fragment);
  }

  async updatePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const password = this.passwordForm.get('password')?.value;

    if (!password) {
      this.errorMessage = 'Password is required';
      this.isLoading = false;
      return;
    }

    const { error } = await this.supabase.updatePassword(password);

    if (error) {
      this.errorMessage = `Error updating password: ${error.message}`;
      this.isLoading = false;
      return;
    }

    this.successMessage = 'Password updated successfully';
    this.isLoading = false;

    setTimeout(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
    }, 1500);
  }

  get passwordControl() {
    return this.passwordForm.get('password');
  }
}
