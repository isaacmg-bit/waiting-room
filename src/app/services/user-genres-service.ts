import { Injectable, signal, inject } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { UserGenre } from '../models/UserGenre';
import { Genre } from '../models/Genre';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserGenresService {
  private readonly api = inject(ApiServiceBack);

  readonly userGenreSignal = signal<UserGenre[]>([]);
  readonly loadingSignal = signal(false);

  private readonly BASE_URL = environment.apiUserGenresUrl;
  private readonly ME_URL = `${environment.apiUserGenresUrl}${environment.apiMeUrl}`;

  loadUserGenres(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserGenre[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (genres) => this.userGenreSignal.set(genres),
        error: (err) => console.error('Error loading user genres:', err),
      });
  }

  addUserGenre(genreId: string, genre: Genre): void {
    const tempId = `temp-${Date.now()}`;
    this.userGenreSignal.update((list) => [...list, { id: tempId, genre_id: genreId, genres: genre }]);

    this.api.post<UserGenre>(this.BASE_URL, { genre_id: genreId }).subscribe({
      next: (created) =>
        this.userGenreSignal.update((list) => list.map((i) => (i.id === tempId ? created : i))),
      error: (err) => {
        console.error('Error adding genre:', err);
        this.userGenreSignal.update((list) => list.filter((i) => i.id !== tempId));
      },
    });
  }

  deleteUserGenre(id: string): void {
    this.userGenreSignal.update((list) => list.filter((g) => g.id !== id));

    this.api.delete<UserGenre>(`${this.BASE_URL}/${id}`).subscribe({
      error: (err) => {
        console.error('Error deleting genre:', err);
        this.loadUserGenres();
      },
    });
  }
}
