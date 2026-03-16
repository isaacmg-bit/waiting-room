import { Injectable, inject, signal, computed } from '@angular/core';
import { UserInstrument } from '../models/UserInstrument';
import { ApiServiceBack } from './apiservice-back';
import { InstrumentsService } from './instruments-service';
import { environment } from '../../environments/environment';
import { finalize, Observable, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserInstrumentsService {
  private readonly api = inject(ApiServiceBack);
  private readonly instrumentService = inject(InstrumentsService);

  readonly userInstrumentSignal = signal<UserInstrument[]>([]);
  readonly loadingSignal = signal(false);
  readonly isModalOpen = signal(false);
  readonly searchQuery = signal('');

  readonly pendingAdds = signal<UserInstrument[]>([]);
  readonly pendingRemoves = signal<string[]>([]);

  readonly filteredInstruments = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.instrumentService.instrumentsSignal();
    return this.instrumentService
      .instrumentsSignal()
      .filter((i) => i.instrument_name.toLowerCase().includes(q));
  });

  readonly allInstruments = computed(() => {
    return [...this.userInstrumentSignal(), ...this.pendingAdds()].sort((a, b) =>
      a.instruments!.instrument_name.localeCompare(b.instruments!.instrument_name),
    );
  });

  private readonly BASE_URL = environment.apiUserInstrumentsUrl;
  private readonly ME_URL = `${environment.apiUserInstrumentsUrl}${environment.apiMeUrl}`;

  loadUserInstruments(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserInstrument[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (instruments) => this.userInstrumentSignal.set(instruments),
        error: (err) => console.error('Error loading user instruments:', err),
      });
  }

  private createPendingInstrument(instrumentId: string, level = 'Beginner') {
    const instrument = this.instrumentService
      .instrumentsSignal()
      .find((i) => i.id === instrumentId);
    if (!instrument) return;

    const tempId = `temp-${Date.now()}`;
    const pending: UserInstrument = {
      id: tempId,
      instrument_id: instrumentId,
      level,
      instruments: instrument,
    };
    this.pendingAdds.update((list) => [...list, pending]);
  }

  private updateLevelInList(list: UserInstrument[], id: string, level: string) {
    return list.map((i) => (i.id === id ? { ...i, level } : i));
  }

  private markForDelete(id: string) {
    this.pendingRemoves.update((list) => [...list, id]);
    this.userInstrumentSignal.update((list) => list.filter((i) => i.id !== id));
  }

  addPendingInstrument(instrumentId: string, level: string) {
    this.createPendingInstrument(instrumentId, level);
  }

  selectInstrument(instrumentId: string) {
    this.createPendingInstrument(instrumentId);
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

  updateInstrumentLevel(userInstrumentId: string, level: string): void {
    if (this.pendingAdds().some((i) => i.id === userInstrumentId)) {
      this.pendingAdds.update((list) => this.updateLevelInList(list, userInstrumentId, level));
      return;
    }

    this.api.patch(`${this.BASE_URL}/${userInstrumentId}`, { level }).subscribe({
      next: () => {
        this.userInstrumentSignal.update((list) =>
          this.updateLevelInList(list, userInstrumentId, level),
        );
      },
      error: (err) => console.error('Error updating instrument level:', err),
    });
  }

  deleteUserInstrument(id: string): void {
    if (this.pendingAdds().some((i) => i.id === id)) {
      this.pendingAdds.update((list) => list.filter((i) => i.id !== id));
      return;
    }

    this.markForDelete(id);
  }

  discardPendingInstruments(): void {
    this.pendingAdds.set([]);
  }

  async savePendingInstruments(): Promise<void> {
    await Promise.all(
      this.pendingAdds().map(async (instr) => {
        try {
          const created = await firstValueFrom(
            this.api.post<UserInstrument>(this.BASE_URL, {
              instrument_id: instr.instrument_id,
              level: instr.level,
            }),
          );
          this.userInstrumentSignal.update((list) => [...list, created]);
        } catch (err) {
          console.error('Error saving instrument:', err);
        }
      }),
    );

    await Promise.all(
      this.pendingRemoves().map(async (id) => {
        try {
          await firstValueFrom(this.api.delete(`${this.BASE_URL}/${id}`));
        } catch (err) {
          console.error('Error deleting instrument:', err);
        }
      }),
    );

    this.pendingAdds.set([]);
    this.pendingRemoves.set([]);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  getInstruments(): Observable<UserInstrument[]> {
    return this.api.get<UserInstrument[]>('/user-instruments/me');
  }

  getInstrumentsByUserId(userId: string): Observable<UserInstrument[]> {
    return this.api.get<UserInstrument[]>(`${this.BASE_URL}/${userId}`);
  }
}
