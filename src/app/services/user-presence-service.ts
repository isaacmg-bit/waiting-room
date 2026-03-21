import { Injectable, inject, signal } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { SocialLinkHandle } from '../models/SocialLinkHandle';
import { User } from '../models/User';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UserPresenceService {
  private readonly api = inject(ApiServiceBack);
  private readonly toast = inject(ToastrService);
  private readonly platformBases: Record<string, string> = environment.socialPlatforms;
  private readonly BASE_URL: string = environment.apiUserUrl;

  readonly socialLinksSignal = signal<SocialLinkHandle[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly pendingLinks = signal<SocialLinkHandle[]>([]);
  private readonly currentUserId = signal<string>('');

  loadUserPresence(): void {
    this.loadingSignal.set(true);
    this.api.get<User>(`${this.BASE_URL}${environment.apiMeUrl}`).subscribe({
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
      error: () => this.loadingSignal.set(false),
    });
  }

  addPendingLink(platform = 'instagram', url = ''): void {
    if (this.pendingLinks().length >= 8) {
      this.toast.warning('You can add a maximum of 8 social links');
      return;
    }

    const normalizedUrl = url.trim().replace(/\/$/, '');
    if (normalizedUrl) {
      const isDuplicate = this.pendingLinks().some(
        (l) => l.platform === platform && l.url.trim().replace(/\/$/, '') === normalizedUrl,
      );
      if (isDuplicate) return;
    }

    this.pendingLinks.update((list) => [...list, { platform, url: normalizedUrl }]);
  }

  deleteLink(index: number): void {
    this.pendingLinks.update((list) => list.filter((_, i) => i !== index));
  }

  discardPendingLinks(): void {
    this.pendingLinks.set([...this.socialLinksSignal()]);
  }

  async savePendingPresence(): Promise<void> {
    const userId = this.currentUserId();
    if (!userId) return;

    this.loadingSignal.set(true);

    const rawLinks: SocialLinkHandle[] = this.pendingLinks()
      .map((l) => ({ platform: l.platform, url: l.url?.trim().replace(/\/$/, '') || '' }))
      .filter((l) => l.url);

    const uniqueLinks: SocialLinkHandle[] = rawLinks.filter(
      (link, index, self) =>
        index === self.findIndex((t) => t.platform === link.platform && t.url === link.url),
    );

    const formattedLinks = uniqueLinks.map((l) => ({
      platform: l.platform,
      url: (this.platformBases[l.platform] || '') + l.url,
    }));

    try {
      await firstValueFrom(
        this.api.patch<User>(`${this.BASE_URL}/${userId}`, { social_links: formattedLinks }),
      );
      this.socialLinksSignal.set(uniqueLinks);
      this.pendingLinks.set([...uniqueLinks]);
    } catch (err: unknown) {
      console.error('Error saving presence:', err);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private extractHandle(platform: string, url: string): string {
    const base = this.platformBases[platform] || '';
    return base ? url.replace(base, '').replace(/\/$/, '') : url;
  }
}
