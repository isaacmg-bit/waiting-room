import { Injectable, signal, inject } from '@angular/core';
import { Genre } from '../models/Genre';
import { environment } from '../../environments/environment';
import { ApiServiceBack } from './apiservice-back';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GenresService {
  private readonly api = inject(ApiServiceBack);

  readonly genresSignal = signal<Genre[]>([]);
  readonly loadingSignal = signal(false);

  private readonly BASE_URL = environment.apiGenresUrl;

  constructor() {
    this.loadGenres();
  }

  loadGenres(): void {
    this.loadingSignal.set(true);
    this.api
      .get<Genre[]>(this.BASE_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (genres) => this.genresSignal.set(genres),
        error: (err) => console.error('Error loading genres:', err),
      });
  }
}
