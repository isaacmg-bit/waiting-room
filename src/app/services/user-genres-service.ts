import { Injectable, signal, inject } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { UserGenre } from '../models/UserGenre';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Genre } from '../models/Genre';

@Injectable({
  providedIn: 'root',
})
export class UserGenresService {
  loadingSignal = signal<boolean>(false);
  api = inject(ApiServiceBack);

  userGenreSignal = signal<UserGenre[]>([]);

  loadUserGenres(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserGenre[]>(this.getMeUrl())
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (genres) => this.userGenreSignal.set(genres),
        error: (err) => console.error('Error loading user genres:', err),
      });
  }

  addUserGenre(genreId: string, genre: Genre): void {
    const tempId = `temp-${Date.now()}`;
    this.userGenreSignal.update((list) => [
      ...list,
      { id: tempId, genre_id: genreId, genres: genre },
    ]);

    this.api.post<UserGenre>(this.getUrl(), { genre_id: genreId }).subscribe({
      next: (created) =>
        this.userGenreSignal.update((list) => list.map((i) => (i.id === tempId ? created : i))),
      error: (err) => {
        console.error('Error adding genre:', err);
        this.userGenreSignal.update((list) => list.filter((i) => i.id !== tempId));
      },
    });
  }
  deleteUserGenre(id: string): void {
    this.userGenreSignal.update((genres) => genres.filter((u) => u.id !== id));

    this.api.delete<UserGenre>(`${this.getUrl()}/${id}`).subscribe({
      error: (err) => {
        console.error('Error deleting genre:', err);
        this.loadUserGenres();
      },
    });
  }

  private getUrl(): string {
    return `${environment.apiUserGenresUrl}`;
  }

  private getMeUrl(): string {
    return `${environment.apiUserGenresUrl}${environment.apiMeUrl}`;
  }
}
