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

  loadUsers() {
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

  addUser(user: User) {
    this.api.post<User>(this.getUsersUrl(), user).subscribe({
      next: (createdUser) => {
        this.usersSignal.update((users) => [...users, createdUser]);
      },
      error: (err) => console.error('Error adding user:', err),
    });
  }

  deleteUser(_id: string) {
    const url = `${this.getUsersUrl()}${_id}`;
    this.api.delete<User>(url).subscribe({
      next: () => {
        this.usersSignal.update((users) => users.filter((u) => u._id !== _id));
      },
      error: (err) => console.error('Error deleting user:', err),
    });
  }

  editUser(_id: string, body: Partial<User>) {
    const url = `${this.getUsersUrl()}${_id}`;
    this.api.patch<User>(url, body).subscribe({
      next: (updatedUser) => {
        this.usersSignal.update((users) => users.map((u) => (u._id === _id ? updatedUser : u)));
      },
      error: (err) => console.error('Error updating user:', err),
    });
  }

  private getUsersUrl() {
    return `${environment.apiUrl}${environment.apiUserUrl}`;
  }
}
