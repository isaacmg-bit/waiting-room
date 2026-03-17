import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { UserTheory } from '../models/UserTheory';
import { environment } from '../../environments/environment';
import { finalize, Observable, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserTheoryService {
  private readonly api = inject(ApiServiceBack);

  readonly userTheorySignal = signal<UserTheory | null>(null);
  readonly loadingSignal = signal<boolean>(false);
  readonly theoryLevels: string[] = ['Basic', 'Composition', 'Advanced Orchestration'];

  readonly pendingKnowsTheory = signal<boolean | null>(null);
  readonly pendingTheoryLevel = signal<string | null>(null);

  readonly currentKnowsTheory = computed<boolean>(
    () => this.pendingKnowsTheory() ?? this.userTheorySignal()?.knows_theory ?? false,
  );
  readonly currentTheoryLevel = computed<string | null>(
    () => this.pendingTheoryLevel() ?? this.userTheorySignal()?.theory_level ?? null,
  );

  private readonly BASE_URL: string = environment.apiUserTheoryUrl;
  private readonly ME_URL: string = `${environment.apiUserTheoryUrl}${environment.apiMeUrl}`;

  loadUserTheory(): void {
    this.loadingSignal.set(true);
    this.api
      .get<UserTheory | UserTheory[]>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (theory: UserTheory | UserTheory[]) => this.setTheoryData(theory),
        error: (err: unknown) => {
          console.error('Error loading theory:', err);
          this.setTheoryData({ knows_theory: false, theory_level: null } as UserTheory);
        },
      });
  }

  onTheoryChange(): void {
    const newValue = !this.currentKnowsTheory();
    this.pendingKnowsTheory.set(newValue);
    if (!newValue) this.pendingTheoryLevel.set(null);
  }

  onTheoryLevelChange(level: string): void {
    this.pendingTheoryLevel.set(level);
  }

  discardPendingTheory(): void {
    this.pendingKnowsTheory.set(null);
    this.pendingTheoryLevel.set(null);
  }

  async saveUserTheory(): Promise<void> {
    const knows: boolean = this.currentKnowsTheory();
    const level: string | null = this.currentTheoryLevel();

    this.loadingSignal.set(true);
    try {
      const created = await firstValueFrom(
        this.api.post<UserTheory>(this.BASE_URL, {
          knows_theory: knows,
          theory_level: level,
        }),
      );
      this.setTheoryData(created);
    } catch (err: unknown) {
      console.error('Error saving theory:', err);
    } finally {
      this.loadingSignal.set(false);
      this.discardPendingTheory();
    }
  }

  getTheory(): Observable<UserTheory[]> {
    return this.api.get<UserTheory[]>(this.ME_URL);
  }

  getTheoryByUserId(userId: string): Observable<UserTheory[]> {
    return this.api.get<UserTheory[]>(`${this.BASE_URL}/${userId}`);
  }

  private setTheoryData(data: UserTheory | UserTheory[] | null): void {
    if (!data) {
      this.userTheorySignal.set(null);
      this.discardPendingTheory();
      return;
    }

    const theory: UserTheory = Array.isArray(data) ? data[0] : data;
    this.userTheorySignal.set(theory);
    this.discardPendingTheory();
  }
}
