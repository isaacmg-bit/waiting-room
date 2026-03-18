import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Band } from '../models/Band';
import { MusicBrainzResponse } from '../models/MusicBrainzResponse';

@Injectable({ providedIn: 'root' })
export class MusicBrainzService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL: string = environment.apiMusicBrainz;

  readonly bandsSignal = signal<Band[]>([]);
  readonly loadingSignal = signal<boolean>(false);

  searchArtists(query: string): void {
    if (!query.trim()) {
      this.bandsSignal.set([]);
      return;
    }

    this.loadingSignal.set(true);

    const term: string = encodeURIComponent(query);
    const url = `${this.BASE_URL}?query=artist:${term}+AND+type:Group&limit=10&fmt=json`;

    this.http
      .get<MusicBrainzResponse>(url)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (res: MusicBrainzResponse) => {
          const bands: Band[] = res.artists.map((a) => ({
            id: a.id,
            name: a.name,
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
