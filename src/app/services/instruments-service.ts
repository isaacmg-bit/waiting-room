import { Injectable, signal, inject } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { Instrument } from '../models/Instrument';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstrumentsService {
  private readonly api = inject(ApiServiceBack);
  loadingSignal = signal<boolean>(false);
  instrumentsSignal = signal<Instrument[]>([]);

  constructor() {
    this.loadInstruments();
  }

  loadInstruments(): void {
    this.loadingSignal.set(true);
    this.api
      .get<Instrument[]>(this.getInstrumentsUrl())
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (instruments) => this.instrumentsSignal.set(instruments),
        error: (err) => console.error('Error loading instruments:', err),
      });
  }

  private getInstrumentsUrl(): string {
    return `${environment.apiUrl}${environment.apiInstrumentsUrl}`;
  }
}
