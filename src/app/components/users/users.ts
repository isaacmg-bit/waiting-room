import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/User';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-users',
  imports: [RouterModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  readonly userService = inject(UserService);

  newUser: Partial<User> = {};
  isEditMode = false;
  editingUserId: string | null = null;

  loadUserForEdit(user: User): void {
    this.isEditMode = true;
    this.editingUserId = user._id;
    this.newUser = { ...user };
  }

  cancelEdit(): void {
    this.resetForm();
  }

  onSubmit(): void {
    if (!this.newUser.name || !this.newUser.email) return;

    if (this.isEditMode && this.editingUserId) {
      this.userService.editUser(this.editingUserId, this.newUser as User);
    } else {
      this.userService.addUser(this.newUser as User);
    }
    this.resetForm();
  }

  onDelete(_id: string): void {
    if (confirm('You sure you wanna delete the user?')) {
      this.userService.deleteUser(_id);
    }
  }

  private resetForm(): void {
    this.newUser = {};
    this.isEditMode = false;
    this.editingUserId = null;
  }
}
