import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { User } from '../models/User';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  readonly usersSignal = signal<User[]>([]);
  readonly loadingSignal = signal(false);

  private readonly USERS_URL = `${environment.apiUrl}${environment.apiUserUrl}`;
  private readonly ME_URL = `${environment.apiUrl}${environment.apiUserUrl}${environment.apiMeUrl}`;

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingSignal.set(true);

    this.api
      .get<User[]>(this.USERS_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (users) => this.usersSignal.set(users),
        error: (err) => console.error('Error loading users:', err),
      });
  }

  addUser(user: User): void {
    this.api.post<User>(this.USERS_URL, user).subscribe({
      next: (createdUser) => this.usersSignal.update((users) => [...users, createdUser]),
      error: (err) => console.error('Error adding user:', err),
    });
  }

  deleteUser(id: string): void {
    this.api.delete<void>(`${this.USERS_URL}/${id}`).subscribe({
      next: () => this.usersSignal.update((users) => users.filter((u) => u.id !== id)),
      error: (err) => console.error('Error deleting user:', err),
    });
  }

  editUser(id: string, body: Partial<User>): void {
    this.api.patch<User>(`${this.USERS_URL}/${id}`, body).subscribe({
      next: (updatedUser) =>
        this.usersSignal.update((users) => users.map((u) => (u.id === id ? updatedUser : u))),
      error: (err) => console.error('Error updating user:', err),
    });
  }

  getMe(): Observable<User> {
    return this.api.get<User>(this.ME_URL);
  }
}
