import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { UserGenre } from '../models/UserGenre';
import { Genre } from '../models/Genre';
import { GenresService } from './genres-service';
import { finalize, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UserGenresService {
  private readonly api = inject(ApiServiceBack);
  private readonly genresService = inject(GenresService);
  private readonly toast = inject(ToastrService);

  readonly userGenreSignal = signal<UserGenre[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');

  readonly pendingGenres = signal<UserGenre[]>([]);
  readonly pendingDeletes = signal<string[]>([]);

  readonly filteredGenres = computed<Genre[]>(() => {
    const query = this.searchQuery().toLowerCase();
    const all = this.genresService.genresSignal();
    return query ? all.filter((g) => g.genre.toLowerCase().includes(query)) : all;
  });

  readonly allGenres = computed<UserGenre[]>(() => [
    ...this.userGenreSignal(),
    ...this.pendingGenres(),
  ]);

  private readonly BASE_URL: string = environment.apiUserGenresUrl;
  private readonly ME_URL: string = `${environment.apiUserGenresUrl}${environment.apiMeUrl}`;

  loadUserGenres(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserGenre[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (genres) => {
          this.userGenreSignal.set(genres);
          this.discardPendingGenres();
        },
        error: (err: unknown) => console.error('Error loading user genres:', err),
      });
  }

  addPendingGenre(genre: Genre): void {
    const exists = [...this.userGenreSignal(), ...this.pendingGenres()].some(
      (ug) => ug.genre_id === genre.id,
    );
    if (exists) {
      this.toast.warning('Genre already added');
      return;
    }

    const newPending: UserGenre = {
      id: `temp-${Date.now()}`,
      genre_id: genre.id,
      genres: genre,
    };

    this.pendingGenres.update((list) => [...list, newPending]);
  }

  deletePendingGenre(id: string): void {
    this.pendingGenres.update((list) => list.filter((g) => g.id !== id));
  }

  deleteUserGenre(id: string): void {
    if (this.pendingGenres().some((g) => g.id === id)) {
      this.deletePendingGenre(id);
      return;
    }

    this.pendingDeletes.update((list) => [...list, id]);
    this.userGenreSignal.update((list) => list.filter((g) => g.id !== id));
  }

  discardPendingGenres(): void {
    this.pendingGenres.set([]);
    this.pendingDeletes.set([]);
  }

  async saveUserGenres(): Promise<void> {
    this.loadingSignal.set(true);

    for (const g of this.pendingGenres()) {
      try {
        const created = await firstValueFrom(
          this.api.post<UserGenre>(this.BASE_URL, { genre_id: g.genre_id }),
        );
        this.userGenreSignal.update((list) => [...list, created]);
      } catch (err: unknown) {
        console.error('Error saving genre:', err);
      }
    }

    for (const id of this.pendingDeletes()) {
      try {
        await firstValueFrom(this.api.delete<void>(`${this.BASE_URL}/${id}`));
      } catch (err: unknown) {
        console.error('Error deleting genre:', err);
      }
    }

    this.pendingGenres.set([]);
    this.pendingDeletes.set([]);
    this.loadingSignal.set(false);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  selectGenre(genre: Genre): void {
    this.addPendingGenre(genre);
    this.closeModal();
  }

  openModal(): void {
    this.searchQuery.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.searchQuery.set('');
  }

  getGenres(): Observable<UserGenre[]> {
    return this.api.get<UserGenre[]>(this.ME_URL);
  }

  getGenresByUserId(userId: string): Observable<UserGenre[]> {
    return this.api.get<UserGenre[]>(`${this.BASE_URL}/${userId}`);
  }
}
