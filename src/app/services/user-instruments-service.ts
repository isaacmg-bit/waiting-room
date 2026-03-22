import { Injectable, inject, signal, computed } from '@angular/core';
import { UserInstrument } from '../models/UserInstrument';
import { ApiServiceBack } from './apiservice-back';
import { InstrumentsService } from './instruments-service';
import { environment } from '../../environments/environment.local';
import { finalize, Observable, firstValueFrom } from 'rxjs';
import { Instrument } from '../models/Instrument';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UserInstrumentsService {
  private readonly api = inject(ApiServiceBack);
  private readonly instrumentService = inject(InstrumentsService);
  private readonly toast = inject(ToastrService);

  readonly userInstrumentSignal = signal<UserInstrument[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');

  readonly pendingInstruments = signal<UserInstrument[]>([]);
  readonly pendingDeletes = signal<string[]>([]);

  readonly filteredInstruments = computed<Instrument[]>(() => {
    const q: string = this.searchQuery().toLowerCase();
    const allInstruments: Instrument[] = this.instrumentService.instrumentsSignal();
    if (!q) return allInstruments;
    return allInstruments.filter((i: Instrument) => i.instrument_name.toLowerCase().includes(q));
  });

  readonly allInstruments = computed<UserInstrument[]>(() => [
    ...this.userInstrumentSignal(),
    ...this.pendingInstruments(),
  ]);

  private readonly BASE_URL: string = environment.apiUserInstrumentsUrl;
  private readonly ME_URL: string = `${environment.apiUserInstrumentsUrl}${environment.apiMeUrl}`;
  private readonly DEFAULT_LEVEL: string = 'Beginner';

  loadUserInstruments(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserInstrument[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (instruments: UserInstrument[]) => {
          this.userInstrumentSignal.set(instruments);
          this.discardPendingInstruments();
        },
        error: (err: unknown) => console.error('Error loading user instruments:', err),
      });
  }

  addPendingInstrument(instrumentId: string, level = this.DEFAULT_LEVEL): void {
    const isDuplicate = [...this.userInstrumentSignal(), ...this.pendingInstruments()].some(
      (ui) => ui.instrument_id === instrumentId,
    );

    if (isDuplicate) {
      this.toast.warning('You have already added this instrument');
      return;
    }

    const instrument = this.instrumentService
      .instrumentsSignal()
      .find((i) => i.id === instrumentId);

    if (!instrument) return;

    const tempId = `temp-${Date.now()}`;
    const newPending: UserInstrument = {
      id: tempId,
      instrument_id: instrumentId,
      level,
      instruments: instrument,
    };

    this.pendingInstruments.update((list: UserInstrument[]) => [...list, newPending]);
  }

  deletePendingInstrument(id: string): void {
    this.pendingInstruments.update((list: UserInstrument[]) => list.filter((i) => i.id !== id));
  }

  deleteUserInstrument(id: string): void {
    if (this.pendingInstruments().some((i: UserInstrument) => i.id === id)) {
      this.deletePendingInstrument(id);
      return;
    }

    this.pendingDeletes.update((list: string[]) => [...list, id]);
    this.userInstrumentSignal.update((list: UserInstrument[]) => list.filter((i) => i.id !== id));
  }

  discardPendingInstruments(): void {
    this.pendingInstruments.set([]);
    this.pendingDeletes.set([]);
  }

  async savePendingInstruments(): Promise<void> {
    this.loadingSignal.set(true);

    for (const instr of this.pendingInstruments()) {
      try {
        const created = await firstValueFrom(
          this.api.post<UserInstrument>(this.BASE_URL, {
            instrument_id: instr.instrument_id,
            level: instr.level,
          }),
        );
        this.userInstrumentSignal.update((list: UserInstrument[]) => [...list, created]);
      } catch (err: unknown) {
        console.error('Error saving instrument:', err);
      }
    }

    for (const id of this.pendingDeletes()) {
      try {
        await firstValueFrom(this.api.delete<void>(`${this.BASE_URL}/${id}`));
      } catch (err: unknown) {
        console.error('Error deleting instrument:', err);
      }
    }

    this.pendingInstruments.set([]);
    this.pendingDeletes.set([]);
    this.loadingSignal.set(false);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  selectInstrument(instrumentId: string): void {
    this.addPendingInstrument(instrumentId);
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
    if (this.pendingInstruments().some((i) => i.id === userInstrumentId)) {
      this.pendingInstruments.update((list: UserInstrument[]) =>
        this.updateLevelInList(list, userInstrumentId, level),
      );
      return;
    }

    this.api.patch<void>(`${this.BASE_URL}/${userInstrumentId}`, { level }).subscribe({
      next: () => {
        this.userInstrumentSignal.update((list: UserInstrument[]) =>
          this.updateLevelInList(list, userInstrumentId, level),
        );
      },
      error: (err: unknown) => console.error('Error updating instrument level:', err),
    });
  }

  getInstruments(): Observable<UserInstrument[]> {
    return this.api.get<UserInstrument[]>(this.ME_URL);
  }

  getInstrumentsByUserId(userId: string): Observable<UserInstrument[]> {
    return this.api.get<UserInstrument[]>(`${this.BASE_URL}/${userId}`);
  }

  private updateLevelInList(list: UserInstrument[], id: string, level: string): UserInstrument[] {
    return list.map((i) => (i.id === id ? { ...i, level } : i));
  }
}
