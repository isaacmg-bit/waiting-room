import { Injectable, inject, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiServiceBack } from './apiservice-back';
import { MusicBrainzService } from './bands-service';
import { UserBand } from '../models/UserBand';
import { finalize } from 'rxjs';
import { Band } from '../models/Band';

@Injectable({
  providedIn: 'root',
})
export class UserBandsService {
  private readonly api = inject(ApiServiceBack);
  private readonly bandsService = inject(MusicBrainzService);

  readonly userBandsSignal = signal<UserBand[]>([]);
  readonly loadingSignal = signal(false);
  readonly isModalOpen = signal(false);
  readonly searchQuery = signal('');

  readonly filteredBands = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.bandsService.bandsSignal();
    return this.bandsService.bandsSignal().filter((i) => i.name.toLowerCase().includes(q));
  });

  private readonly BASE_URL = environment.apiUserBandsUrl;
  private readonly ME_URL = `${environment.apiUserBandsUrl}${environment.apiMeUrl}`;

  loadUserBands(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserBand[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (bands) => this.userBandsSignal.set(bands),
        error: (err) => console.error('Error loading user bands:', err),
      });
  }

  addUserBand(bandName: string, bandId: string): void {
    const tempId = `temp-${Date.now()}`;

    this.userBandsSignal.update((list) => [...list, { id: tempId, name: bandName }]);

    this.api
      .post<UserBand>(this.BASE_URL, {
        band_id: bandId,
        name: bandName,
      })
      .subscribe({
        next: (created) => {
          this.userBandsSignal.update((list) => list.map((i) => (i.id === tempId ? created : i)));
        },
        error: (err) => {
          console.error('Error adding band:', err);
          this.userBandsSignal.update((list) => list.filter((i) => i.id !== tempId));
        },
      });
  }

  deleteUserBand(id: string): void {
    this.userBandsSignal.update((list) => list.filter((g) => g.id !== id));

    this.api.delete<UserBand>(`${this.BASE_URL}/${id}`).subscribe({
      error: (err) => {
        console.error('Error deleting band:', err);
        this.loadUserBands();
      },
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.bandsService.searchArtists(query);
  }

  selectBand(band: Band): void {
    this.addUserBand(band.name, band.id);
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
}
