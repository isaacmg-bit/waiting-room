import { Injectable, inject, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiServiceBack } from './apiservice-back';
import { MusicBrainzService } from './bands-service';
import { UserBand } from '../models/UserBand';
import { Band } from '../models/Band';
import { finalize, firstValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserBandsService {
  private readonly api = inject(ApiServiceBack);
  private readonly bandsService = inject(MusicBrainzService);

  readonly userBandsSignal = signal<UserBand[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');

  readonly pendingBands = signal<UserBand[]>([]);
  readonly pendingDeletes = signal<string[]>([]);

  readonly filteredBands = computed<Band[]>(() => {
    return this.bandsService.bandsSignal();
  });

  readonly allBands = computed<UserBand[]>(() => [
    ...this.userBandsSignal(),
    ...this.pendingBands(),
  ]);

  private readonly BASE_URL: string = environment.apiUserBandsUrl;
  private readonly ME_URL: string = `${environment.apiUserBandsUrl}${environment.apiMeUrl}`;

  loadUserBands(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserBand[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (bands: UserBand[]) => {
          this.userBandsSignal.set(bands);
          this.discardPendingBands();
        },
        error: (err: unknown) => console.error('Error loading user bands:', err),
      });
  }

  addPendingBand(band: Band): void {
    const newPending: UserBand = {
      id: band.id,
      name: band.name,
    };
    this.pendingBands.update((list: UserBand[]) => [...list, newPending]);
  }

  deletePendingBand(id: string): void {
    this.pendingBands.update((list: UserBand[]) => list.filter((b: UserBand) => b.id !== id));
  }

  deleteUserBand(id: string): void {
    if (this.pendingBands().some((b: UserBand) => b.id === id)) {
      this.deletePendingBand(id);
      return;
    }

    this.pendingDeletes.update((list: string[]) => [...list, id]);
    this.userBandsSignal.update((list: UserBand[]) => list.filter((b: UserBand) => b.id !== id));
  }

  discardPendingBands(): void {
    this.pendingBands.set([]);
    this.pendingDeletes.set([]);
  }

  async savePendingBands(): Promise<void> {
    this.loadingSignal.set(true);

    for (const band of this.pendingBands()) {
      try {
        const created = await firstValueFrom(
          this.api.post<UserBand>(this.BASE_URL, {
            id: band.id,
            name: band.name,
          }),
        );
        this.userBandsSignal.update((list: UserBand[]) => [...list, created]);
      } catch (err: unknown) {
        console.error('Error saving band:', err);
      }
    }

    for (const id of this.pendingDeletes()) {
      try {
        await firstValueFrom(this.api.delete<void>(`${this.BASE_URL}/${id}`));
      } catch (err: unknown) {
        console.error('Error deleting band:', err);
      }
    }

    this.pendingBands.set([]);
    this.pendingDeletes.set([]);
    this.loadingSignal.set(false);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.bandsService.searchArtists(query);
  }

  selectBand(band: Band): void {
    this.addPendingBand(band);
    this.closeModal();
  }

  openModal(): void {
    this.searchQuery.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.searchQuery.set('');
    this.bandsService.bandsSignal.set([]);
  }

  getBandsByUserId(userId: string): Observable<UserBand[]> {
    return this.api.get<UserBand[]>(`${this.BASE_URL}/${userId}`);
  }
}
