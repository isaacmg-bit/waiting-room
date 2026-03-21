import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';

interface ResetPasswordForm {
  password: FormControl<string>;
}

@Component({
  selector: 'app-reset-pass',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-pass.html',
})
export class ResetPass implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly supabase = inject(SupabaseService);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  readonly passwordForm: FormGroup<ResetPasswordForm> = this.fb.group({
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  ngOnInit(): void {
    const fragment = this.route.snapshot.fragment;
    if (fragment) {
      this.supabase.setSessionFromFragment(fragment);
    }
  }

  async updatePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { password } = this.passwordForm.getRawValue();

    try {
      const { error } = await this.supabase.updatePassword(password);

      if (error) {
        throw error;
      }

      this.successMessage.set('Password updated successfully');

      setTimeout(() => {
        this.router.navigate(['/login'], { replaceUrl: true });
      }, 1500);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error updating password');
    } finally {
      this.isLoading.set(false);
    }
  }

  get passwordControl() {
    return this.passwordForm.controls.password;
  }
}
