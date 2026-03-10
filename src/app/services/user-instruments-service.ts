import { Injectable, inject, signal } from '@angular/core';
import { UserInstrument } from '../models/UserInstrument';
import { ApiServiceBack } from './apiservice-back';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserInstrumentsService {
  loadingSignal = signal<boolean>(false);
  api = inject(ApiServiceBack);

  userInstrumentSignal = signal<UserInstrument[]>([]);

  loadUserInstruments(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserInstrument[]>(this.getUserInstrumentsUrl())
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

    this.api
      .post<UserInstrument>(this.getUserInstrumentsUrl(), { instrument_id: instrumentId, level })
      .subscribe({
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

  deleteUserInstrument(id: string): void {
    this.userInstrumentSignal.update((instruments) => instruments.filter((u) => u.id !== id));

    this.api.delete<UserInstrument>(`${this.getUserInstrumentsUrl()}${id}`).subscribe({
      error: (err) => {
        console.error('Error deleting instrument:', err);
        this.loadUserInstruments();
      },
    });
  }

  private getUserInstrumentsUrl(): string {
    return `${environment.apiUrl}${environment.apiUserInstrumentsUrl}`;
  }
}
