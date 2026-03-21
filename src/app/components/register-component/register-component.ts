import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SupabaseService } from '../../services/supabase-service';

interface RegisterForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-register-component',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);

  readonly isLoading = signal<boolean>(false);

  readonly form: FormGroup<RegisterForm> = this.fb.group({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.toast.warning('Please fill in all fields correctly');
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.isLoading.set(true);

    try {
      const { error } = await this.supabase.signUp(email, password);
      if (error) throw error;

      this.toast.success('Account created! Check your email to verify');
      this.router.navigate(['/login']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      this.toast.error(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
