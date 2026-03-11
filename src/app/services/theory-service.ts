import { Injectable, inject, signal } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { UserTheory } from '../models/UserTheory';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserTheoryService {
  private readonly api = inject(ApiServiceBack);

  readonly userTheorySignal = signal<UserTheory | null>(null);
  readonly loadingSignal = signal(false);

  private readonly BASE_URL = environment.apiUserTheoryUrl;
  private readonly ME_URL = `${environment.apiUserTheoryUrl}${environment.apiMeUrl}`;

  loadUserTheory(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserTheory>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (theory) => this.userTheorySignal.set(theory),
        error: (err) => {
          console.error('Error loading theory:', err);
          this.userTheorySignal.set({ knows_theory: false, theory_level: null } as UserTheory);
        },
      });
  }

  saveUserTheory(knowsTheory: boolean, theoryLevel: string | null): void {
    this.loadingSignal.set(true);
    this.api
      .post<UserTheory>(this.BASE_URL, { knows_theory: knowsTheory, theory_level: theoryLevel })
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (created) => this.userTheorySignal.set(created),
        error: (err) => console.error('Error saving theory:', err),
      });
  }

  updateUserTheory(knowsTheory: boolean, theoryLevel: string | null): void {
    this.loadingSignal.set(true);
    this.api
      .patch<UserTheory>(this.ME_URL, { knows_theory: knowsTheory, theory_level: theoryLevel })
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (updated) => this.userTheorySignal.set(updated),
        error: (err) => console.error('Error updating theory:', err),
      });
  }
}
