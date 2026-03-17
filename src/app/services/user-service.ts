import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { User } from '../models/User';
import { ApiServiceBack } from './apiservice-back';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiServiceBack);
  private readonly toast = inject(ToastrService);

  readonly usersSignal = signal<User[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly editingUserId = signal<string | null>(null);

  private readonly USERS_URL: string = environment.apiUserUrl;
  private readonly ME_URL: string = `${environment.apiUserUrl}${environment.apiMeUrl}`;

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingSignal.set(true);
    this.api
      .get<User[]>(this.USERS_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (users: User[]) => this.usersSignal.set(users),
        error: (err: unknown) => {
          console.error('Error loading users:', err);
          this.toast.error('Error loading users');
        },
      });
  }

  addUser(user: User): void {
    this.api.post<User>(this.USERS_URL, user).subscribe({
      next: (createdUser: User) => {
        this.usersSignal.update((users: User[]) => [...users, createdUser]);
        this.toast.success('User created successfully');
      },
      error: (err: unknown) => {
        console.error('Error adding user:', err);
        this.toast.error('Error creating user');
      },
    });
  }

  editUser(id: string, body: Partial<User>): void {
    this.api.patch<User>(`${this.USERS_URL}/${id}`, body).subscribe({
      next: (updatedUser: User) => {
        this.usersSignal.update((users: User[]) =>
          users.map((u: User) => (u.id === id ? updatedUser : u)),
        );
        this.toast.success('User updated successfully');
      },
      error: (err: unknown) => {
        console.error('Error updating user:', err);
        this.toast.error('Error updating user');
      },
    });
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.api.delete<void>(`${this.USERS_URL}/${id}`).subscribe({
        next: () => {
          this.usersSignal.update((users: User[]) => users.filter((u: User) => u.id !== id));
          this.toast.success('User deleted successfully');
        },
        error: (err: unknown) => {
          console.error('Error deleting user:', err);
          this.toast.error('Error deleting user');
        },
      });
    }
  }

  loadUserForEdit(user: User): void {
    this.isEditMode.set(true);
    this.editingUserId.set(user.id);
  }

  cancelEdit(): void {
    this.resetEditState();
  }

  submitUser(userData: User): void {
    const currentId = this.editingUserId();
    if (this.isEditMode() && currentId) {
      this.editUser(currentId, userData);
    } else {
      this.addUser(userData);
    }
    this.resetEditState();
  }

  private resetEditState(): void {
    this.isEditMode.set(false);
    this.editingUserId.set(null);
  }

  getUserById(id: string): Observable<User> {
    return this.api.get<User>(`${this.USERS_URL}/${id}`);
  }

  getMe(): Observable<User> {
    return this.api.get<User>(this.ME_URL);
  }

  getRandomUsers(): Observable<User[]> {
    const url = `${environment.apiSearchRandomMusicians}`;
    return this.api.get<User[]>(url);
  }
}
