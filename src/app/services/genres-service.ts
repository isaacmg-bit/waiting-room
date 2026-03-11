import { Injectable, inject, signal } from '@angular/core';
import { Genre } from '../models/Genre';
import { environment } from '../../environments/environment';
import { ApiServiceBack } from './apiservice-back';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GenresService {
  private readonly api = inject(ApiServiceBack);
  loadingSignal = signal<boolean>(false);
  genresSignal = signal<Genre[]>([]);

  constructor() {
    this.loadGenres();
  }

  loadGenres(): void {
    this.loadingSignal.set(true);
    this.api
      .get<Genre[]>(this.getGenresUrl())
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (genres) => this.genresSignal.set(genres),
        error: (err) => console.error('Error loading genres:', err),
      });
  }

  private getGenresUrl(): string {
    return `${environment.apiGenresUrl}`;
  }
}
