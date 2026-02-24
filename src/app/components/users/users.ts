import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/User';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  userForm!: FormGroup;
  isEditMode = false;
  editingUserId: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      location: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  loadUserForEdit(user: User): void {
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      location: user.location,
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const userData = this.userForm.getRawValue() as User;

    if (this.isEditMode && this.editingUserId) {
      this.userService.editUser(this.editingUserId, userData);
    } else {
      this.userService.addUser(userData);
    }

    this.resetForm();
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you wanna delete the user?')) {
      this.userService.deleteUser(id);
    }
  }

  private resetForm(): void {
    this.userForm.reset();
    this.isEditMode = false;
    this.editingUserId = null;
  }

  get nameError(): string {
    const control = this.userForm.get('name');
    if (control?.hasError('required')) return 'Name is required';
    if (control?.hasError('minlength')) return 'Name must be at least 2 characters';
    return '';
  }

  get emailError(): string {
    const control = this.userForm.get('email');
    if (control?.hasError('required')) return 'Email is required';
    if (control?.hasError('email')) return 'Invalid email format';
    return '';
  }

  get locationError(): string {
    const control = this.userForm.get('location');
    if (control?.hasError('required')) return 'Location is required';
    if (control?.hasError('minlength')) return 'Location must be at least 2 characters';
    return '';
  }
}
