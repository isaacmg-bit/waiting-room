import { Component, inject, signal, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { User } from '../../models/User';
import { UserService } from '../../services/user-service';
import { SupabaseService } from '../../services/supabase-service';

@Component({
  selector: 'app-users',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  readonly userService = inject(UserService);
  readonly supabase = inject(SupabaseService);
  private readonly fb = inject(FormBuilder);
  readonly userId = signal<string | null>(null);
  userRole = this.supabase.userRole();

  constructor() {
    effect(() => {
      this.supabase.getSession().then(({ data: { session } }) => {
        if (session?.user.id) {
          this.userId.set(session.user.id);
          this.supabase.loadUserRole(this.userId()!);
        } else {
          this.userId.set(null);
        }
      });
    });
  }

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    location: ['', [Validators.required, Validators.minLength(2)]],
    role: ['user'],
  });

  loadUserForEdit(user: User): void {
    this.userService.loadUserForEdit(user);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      location: user.location,
      role: user.role,
    });
  }

  cancelEdit(): void {
    this.userService.cancelEdit();
    this.resetForm();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
    const userData = this.userForm.getRawValue() as User;
    this.userService.submitUser(userData);
    this.resetForm();
  }

  onDelete(id: string): void {
    this.userService.deleteUser(id);
  }

  private resetForm(): void {
    this.userForm.reset();
  }

  getFieldError(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) return `${this.capitalize(fieldName)} is required`;
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength')?.requiredLength;
      return `${this.capitalize(fieldName)} must be at least ${minLength} characters`;
    }
    if (control.hasError('email')) return `Invalid ${this.capitalize(fieldName)} format`;

    return '';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
