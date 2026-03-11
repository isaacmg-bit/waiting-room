import { Injectable, signal, inject } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { Instrument } from '../models/Instrument';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstrumentsService {
  private readonly api = inject(ApiServiceBack);

  readonly instrumentsSignal = signal<Instrument[]>([]);
  readonly loadingSignal = signal(false);

  private readonly BASE_URL = environment.apiInstrumentsUrl;

  constructor() {
    this.loadInstruments();
  }

  loadInstruments(): void {
    this.loadingSignal.set(true);
    this.api
      .get<Instrument[]>(this.BASE_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (instruments) => this.instrumentsSignal.set(instruments),
        error: (err) => console.error('Error loading instruments:', err),
      });
  }
}
