import { Injectable, signal, inject } from '@angular/core';
import { Genre } from '../models/Genre';
import { environment } from '../../environments/environment.prod';
import { ApiServiceBack } from './apiservice-back';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GenresService {
  private readonly api = inject(ApiServiceBack);
  private readonly BASE_URL: string = environment.apiGenresUrl;

  readonly genresSignal = signal<Genre[]>([]);
  readonly loadingSignal = signal<boolean>(false);

  constructor() {
    this.loadGenres();
  }

  loadGenres(): void {
    this.loadingSignal.set(true);
    this.api
      .get<Genre[]>(this.BASE_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (genres: Genre[]) => this.genresSignal.set(genres),
        error: (err: unknown) => console.error('Error loading genres:', err),
      });
  }
}
