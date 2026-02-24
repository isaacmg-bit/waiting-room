import { Injectable, inject, signal } from '@angular/core';
import { User } from '../models/User';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);

  usersSignal = signal<User[]>([]);
  loadingSignal = signal<boolean>(false);

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingSignal.set(true);
    this.api.get<User[]>(this.getUsersUrl()).subscribe({
      next: (users) => {
        this.usersSignal.set(users);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loadingSignal.set(false);
      },
    });
  }

  addUser(user: User): void {
    this.api.post<User>(this.getUsersUrl(), user).subscribe({
      next: (createdUser) => {
        this.usersSignal.update((users) => [...users, createdUser]);
      },
      error: (err) => console.error('Error adding user:', err),
    });
  }

  deleteUser(id: string): void {
    const url = `${this.getUsersUrl()}${id}`;
    this.api.delete<User>(url).subscribe({
      next: () => {
        this.usersSignal.update((users) => users.filter((u) => u.id !== id));
      },
      error: (err) => console.error('Error deleting user:', err),
    });
  }

  editUser(id: string, body: Partial<User>): void {
    const url = `${this.getUsersUrl()}${id}`;
    this.api.patch<User>(url, body).subscribe({
      next: (updatedUser) => {
        this.usersSignal.update((users) => users.map((u) => (u.id === id ? updatedUser : u)));
      },
      error: (err) => console.error('Error updating user:', err),
    });
  }

  private getUsersUrl(): string {
    return `${environment.apiUrl}${environment.apiUserUrl}`;
  }
}
