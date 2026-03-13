import { Injectable, inject, signal, computed } from '@angular/core';
import { UserInstrument } from '../models/UserInstrument';
import { ApiServiceBack } from './apiservice-back';
import { InstrumentsService } from './instruments-service';
import { environment } from '../../environments/environment';
import { finalize, Observable } from 'rxjs';
import { Instrument } from '../models/Instrument';

@Injectable({
  providedIn: 'root',
})
export class UserInstrumentsService {
  private readonly api = inject(ApiServiceBack);
  private readonly instrumentService = inject(InstrumentsService);

  readonly userInstrumentSignal = signal<UserInstrument[]>([]);
  readonly loadingSignal = signal(false);
  readonly isModalOpen = signal(false);
  readonly searchQuery = signal('');

  readonly filteredInstruments = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.instrumentService.instrumentsSignal();
    return this.instrumentService
      .instrumentsSignal()
      .filter((i) => i.instrument_name.toLowerCase().includes(q));
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

  addUserInstrument(instrumentId: string, level: string): void {
    const tempId = `temp-${Date.now()}`;
    this.userInstrumentSignal.update((list) => [
      ...list,
      { id: tempId, instrument_id: instrumentId, level, instruments: null as any },
    ]);

    this.api.post<UserInstrument>(this.BASE_URL, { instrument_id: instrumentId, level }).subscribe({
      next: (created) =>
        this.userInstrumentSignal.update((list) =>
          list.map((i) => (i.id === tempId ? created : i)),
        ),
      error: (err) => {
        console.error('Error adding instrument:', err);
        this.userInstrumentSignal.update((list) => list.filter((i) => i.id !== tempId));
      },
    });
  }

  updateInstrumentLevel(userInstrumentId: string, level: string): void {
    this.api.patch(`${this.BASE_URL}/${userInstrumentId}`, { level }).subscribe({
      next: () => {
        this.userInstrumentSignal.update((list) =>
          list.map((i) => (i.id === userInstrumentId ? { ...i, level } : i)),
        );
      },
      error: (err) => console.error('Error updating instrument level:', err),
    });
  }

  deleteUserInstrument(id: string): void {
    this.userInstrumentSignal.update((list) => list.filter((i) => i.id !== id));

    this.api.delete<UserInstrument>(`${this.BASE_URL}/${id}`).subscribe({
      error: (err) => {
        console.error('Error deleting instrument:', err);
        this.loadUserInstruments();
      },
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  selectInstrument(instrumentId: string): void {
    this.addUserInstrument(instrumentId, 'Beginner');
    this.closeModal();
  }

  getInstruments() {
    return this.api.get<UserInstrument[]>('/user-instruments/me');
  }

  getInstrumentsByUserId(userId: string): Observable<UserInstrument[]> {
    return this.api.get<UserInstrument[]>(`${this.BASE_URL}/${userId}`);
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
