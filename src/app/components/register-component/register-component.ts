import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { UserService } from '../../services/user-service';
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
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  loading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    location: ['', [Validators.required, Validators.minLength(2)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const { name, email, password, location } = this.form.getRawValue();

    try {
      this.loading = true;

      const { data, error } = await this.supabase.signUp(email!, password!);
      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error('No user returned from Supabase');

      await this.userService.addUser({
        id: user.id,
        email: email!,
        name: name!,
        location: location!,
      } as any);

      alert('User created successfully');

      this.router.navigate(['/login']);
    } catch (err) {
      console.error(err);
      alert('Error creating user');
    } finally {
      this.loading = false;
    }
  }
}
