import { Injectable, inject, signal } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { UserTheory } from '../models/UserTheory';
import { environment } from '../../environments/environment';
import { finalize, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserTheoryService {
  private readonly api = inject(ApiServiceBack);

  readonly userTheorySignal = signal<UserTheory | null>(null);
  readonly loadingSignal = signal(false);
  readonly knowsTheory = signal(false);
  readonly selectedTheoryLevel = signal<string | null>(null);
  readonly theoryLevels = ['Basic', 'Composition', 'Advanced Orchestration'];

  private readonly BASE_URL = environment.apiUserTheoryUrl;
  private readonly ME_URL = `${environment.apiUserTheoryUrl}${environment.apiMeUrl}`;

  loadUserTheory(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserTheory>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (theory) => this.setTheoryData(theory),
        error: (err) => {
          console.error('Error loading theory:', err);
          this.setTheoryData({ knows_theory: false, theory_level: null } as UserTheory);
        },
      });
  }

  saveUserTheory(): void {
    this.loadingSignal.set(true);
    this.api
      .post<UserTheory>(this.BASE_URL, {
        knows_theory: this.knowsTheory(),
        theory_level: this.selectedTheoryLevel(),
      })
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (created) => this.setTheoryData(created),
        error: (err) => console.error('Error saving theory:', err),
      });
  }

  updateUserTheory(): void {
    this.loadingSignal.set(true);
    this.api
      .patch<UserTheory>(this.ME_URL, {
        knows_theory: this.knowsTheory(),
        theory_level: this.selectedTheoryLevel(),
      })
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (updated) => this.setTheoryData(updated),
        error: (err) => console.error('Error updating theory:', err),
      });
  }

  onTheoryChange(): void {
    if (!this.knowsTheory()) {
      this.selectedTheoryLevel.set(null);
    }
    this.updateUserTheory();
  }

  onTheoryLevelChange(): void {
    this.updateUserTheory();
  }

  getTheory() {
    return this.api.get<UserTheory[]>('/user-theory/me');
  }

  getTheoryByUserId(userId: string): Observable<UserTheory[]> {
    return this.api.get<UserTheory[]>(`${this.BASE_URL}/${userId}`);
  }

  private setTheoryData(theory: UserTheory): void {
    this.userTheorySignal.set(theory);
    this.knowsTheory.set(theory.knows_theory);
    this.selectedTheoryLevel.set(theory.theory_level);
  }
}
