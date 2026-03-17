import { Injectable, inject, signal } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { SocialLinkHandle } from '../models/SocialLinkHandle';
import { User } from '../models/User';

@Injectable({ providedIn: 'root' })
export class UserPresenceService {
  private readonly api = inject(ApiServiceBack);

  private readonly platformBases: Record<string, string> = environment.socialPlatforms;

  readonly socialLinksSignal = signal<SocialLinkHandle[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly pendingLinks = signal<SocialLinkHandle[]>([]);

  private readonly currentUserId = signal<string>('');

  private readonly BASE_URL: string = environment.apiUserUrl;
  private readonly ME_URL: string = `${environment.apiUserUrl}${environment.apiMeUrl}`;

  loadUserPresence(): void {
    this.loadingSignal.set(true);
    this.api.get<User>(this.ME_URL).subscribe({
      next: (user: User) => {
        this.currentUserId.set(user.id);

        const links: SocialLinkHandle[] = (user.social_links || []).map((l) => ({
          platform: l.platform,
          url: this.extractHandle(l.platform, l.url),
        }));

        this.socialLinksSignal.set(links);
        this.pendingLinks.set([...links]);
        this.loadingSignal.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading presence:', err);
        this.loadingSignal.set(false);
      },
    });
  }

  addPendingLink(platform = 'instagram', url = ''): void {
    this.pendingLinks.update((list: SocialLinkHandle[]) => [...list, { platform, url }]);
  }

  deleteLink(index: number): void {
    this.pendingLinks.update((list: SocialLinkHandle[]) => {
      const newList = list.filter((_, i) => i !== index);
      return newList.length === 0 ? [{ platform: 'instagram', url: '' }] : newList;
    });
  }

  discardPendingLinks(): void {
    this.pendingLinks.set([...this.socialLinksSignal()]);
  }

  async savePendingPresence(): Promise<void> {
    const userId: string = this.currentUserId();
    if (!userId) return;

    this.loadingSignal.set(true);

    const validRawLinks = this.pendingLinks().filter((l) => l.url?.trim());
    const formattedLinks: SocialLinkHandle[] = validRawLinks.map((l) => ({
      platform: l.platform,
      url: (this.platformBases[l.platform] || '') + l.url.trim(),
    }));

    try {
      await firstValueFrom(
        this.api.patch<User>(`${this.BASE_URL}/${userId}`, {
          social_links: formattedLinks,
        }),
      );

      this.socialLinksSignal.set([...this.pendingLinks()]);
    } catch (err: unknown) {
      console.error('Error saving presence:', err);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getUserPresence(): Observable<User> {
    return this.api.get<User>(this.ME_URL);
  }

  private extractHandle(platform: string, url: string): string {
    const base: string = this.platformBases[platform];
    return base ? url.replace(base, '').replace(/\/$/, '') : url;
  }
}
