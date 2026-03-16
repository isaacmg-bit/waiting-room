import { Injectable, inject, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiServiceBack } from './apiservice-back';
import { MusicBrainzService } from './bands-service';
import { UserBand } from '../models/UserBand';
import { Band } from '../models/Band';
import { finalize, Observable, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserBandsService {
  private readonly api = inject(ApiServiceBack);
  private readonly bandsService = inject(MusicBrainzService);

  readonly userBandsSignal = signal<UserBand[]>([]);
  readonly loadingSignal = signal(false);
  readonly isModalOpen = signal(false);
  readonly searchQuery = signal('');

  readonly pendingBands = signal<UserBand[]>([]);
  readonly pendingDeletes = signal<string[]>([]);

  readonly filteredBands = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.bandsService.bandsSignal();
    return this.bandsService.bandsSignal().filter((i) => i.name.toLowerCase().includes(q));
  });

  readonly allBands = computed(() => [...this.userBandsSignal(), ...this.pendingBands()]);

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

  addPendingBand(bandName: string, bandId: string): void {
    const tempId = `temp-${Date.now()}`;
    this.pendingBands.update((list) => [...list, { id: tempId, name: bandName, band_id: bandId }]);
  }

  deleteBand(id: string): void {
    if (this.pendingBands().some((b) => b.id === id)) {
      this.pendingBands.update((list) => list.filter((b) => b.id !== id));
      return;
    }
    this.pendingDeletes.update((list) => [...list, id]);
    this.userBandsSignal.update((list) => list.filter((b) => b.id !== id));
  }

  discardPendingBands(): void {
    this.pendingBands.set([]);
    this.pendingDeletes.set([]);
  }

  async savePendingBands(): Promise<void> {
    for (const band of this.pendingBands()) {
      try {
        const created = await firstValueFrom(
          this.api.post<UserBand>(this.BASE_URL, { band_id: band.id, name: band.name }),
        );
        this.userBandsSignal.update((list) => [...list, created]);
      } catch (err) {
        console.error('Error saving band:', err);
      }
    }

    for (const id of this.pendingDeletes()) {
      try {
        await firstValueFrom(this.api.delete(`${this.BASE_URL}/${id}`));
      } catch (err) {
        console.error('Error deleting band:', err);
      }
    }

    this.pendingBands.set([]);
    this.pendingDeletes.set([]);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.bandsService.searchArtists(query);
  }

  selectBand(band: Band): void {
    this.addPendingBand(band.name, band.id);
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

  getBands(): Observable<UserBand[]> {
    return this.api.get<UserBand[]>('/user-bands/me');
  }

  getBandsByUserId(userId: string): Observable<UserBand[]> {
    return this.api.get<UserBand[]>(`${this.BASE_URL}/${userId}`);
  }
}
