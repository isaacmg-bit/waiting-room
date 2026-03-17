import { Injectable, inject, signal } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { SocialLinkHandle } from '../models/SocialLinkHandle';
import { User } from '../models/User';

@Injectable({ providedIn: 'root' })
export class UserPresenceService {
  private readonly api = inject(ApiServiceBack);
  private readonly platformBases = environment.socialPlatforms;

  readonly socialLinksSignal = signal<SocialLinkHandle[]>([]);
  readonly pendingLinks = signal<SocialLinkHandle[]>([]);

  readonly loadingSignal = signal(false);
  private currentUserId: string | null = null;

  loadUserPresence(): void {
    this.api.get<User>(`${environment.apiUserUrl}${environment.apiMeUrl}`).subscribe((user) => {
      this.currentUserId = user.id;
      const links = (user.social_links || []).map((l) => ({
        platform: l.platform,
        url: this.extractHandle(l.platform, l.url),
      }));
      this.socialLinksSignal.set(links);
      this.pendingLinks.set(links);
    });
  }

  removeLink(index: number) {
    this.pendingLinks.update((list) => {
      const newList = list.filter((_, i) => i !== index);
      return newList.length === 0 ? [{ platform: 'instagram', url: '' }] : newList;
    });
  }

  async savePendingPresence(): Promise<void> {
    if (!this.currentUserId) return;

    const validRawLinks = this.pendingLinks().filter((l) => l.url?.trim());

    const formattedLinks = validRawLinks.map((l) => ({
      platform: l.platform,
      url:
        (this.platformBases[l.platform as keyof typeof environment.socialPlatforms] || '') +
        l.url.trim(),
    }));

    this.loadingSignal.set(true);
    try {
      await firstValueFrom(
        this.api.patch(`${environment.apiUserUrl}/${this.currentUserId}`, {
          social_links: formattedLinks,
        }),
      );
    } catch (err) {
      console.error('Error saving presence:', err);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private extractHandle(platform: string, url: string): string {
    const base = this.platformBases[platform as keyof typeof environment.socialPlatforms];
    return base ? url.replace(base, '').replace(/\/$/, '') : url;
  }
}
