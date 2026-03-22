import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // ✅ AÑADE ESTO
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { Band } from '../models/Band';
import { MusicBrainzResponse } from '../models/MusicBrainzResponse';

@Injectable({ providedIn: 'root' })
export class MusicBrainzService {
  private readonly http = inject(HttpClient); // ✅ CAMBIA ApiServiceBack por HttpClient
  private readonly BASE_URL: string = environment.apiMusicBrainz;

  readonly bandsSignal = signal<Band[]>([]);
  readonly loadingSignal = signal<boolean>(false);

  searchArtists(query: string): void {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      this.bandsSignal.set([]);
      return;
    }

    this.loadingSignal.set(true);

    this.http // ✅ Ahora es this.http, no this.api
      .get<MusicBrainzResponse>(this.BASE_URL, {
        params: { query: trimmedQuery },
      })
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (res: MusicBrainzResponse) => {
          const bands: Band[] = res.artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
          }));
          this.bandsSignal.set(bands);
        },
        error: (err: unknown) => {
          console.error('Error fetching artists:', err);
          this.bandsSignal.set([]);
        },
      });
  }
}
