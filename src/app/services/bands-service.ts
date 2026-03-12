import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Band } from '../models/Band';

@Injectable({ providedIn: 'root' })
export class MusicBrainzService {
  private readonly http = inject(HttpClient);

  readonly bandsSignal = signal<Band[]>([]);
  readonly loadingSignal = signal(false);

  private readonly BASE_URL = `${environment.apiMusicBrainz}`;

  searchArtists(query: string): void {
    if (!query) {
      this.bandsSignal.set([]);
      return;
    }

    this.loadingSignal.set(true);

    const term = encodeURIComponent(query);
    const url = `${this.BASE_URL}?query=artist:${term}+AND+type:Group&limit=10&fmt=json`;

    this.http
      .get<{ artists: { id: string; name: string }[] }>(url)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (res) =>
          this.bandsSignal.set(
            res.artists.map((a) => ({
              id: a.id,
              name: a.name,
            })),
          ),
        error: (err) => {
          console.error('Error fetching artists:', err);
          this.bandsSignal.set([]);
        },
      });
  }
}
