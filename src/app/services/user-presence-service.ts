import { Injectable, inject, signal } from '@angular/core';
import { ApiServiceBack } from './apiservice-back';
import { environment } from '../../environments/environment';
import { finalize, firstValueFrom } from 'rxjs';
import { User } from '../models/User';
import { SocialLinkHandle } from '../models/SocialLinkHandle';

@Injectable({ providedIn: 'root' })
export class UserPresenceService {
  private readonly api = inject(ApiServiceBack);
  private readonly platformBases = environment.socialPlatforms;

  // Signals de estado
  readonly socialLinksSignal = signal<SocialLinkHandle[]>([]);
  readonly loadingSignal = signal(false);

  // Variable privada para guardar el UUID real del usuario
  private currentUserId: string | null = null;

  // URL para obtener mis datos (GET /users/me)
  private readonly ME_URL = `${environment.apiUserUrl}${environment.apiMeUrl}`;
  // URL base para actualizar (PATCH /users)
  private readonly USERS_BASE_URL = environment.apiUserUrl;

  /**
   * Carga el perfil, extrae el ID real y transforma las URLs a handles
   */
  loadUserPresence(): void {
    this.loadingSignal.set(true);

    this.api
      .get<User>(this.ME_URL)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (user: User) => {
          // Guardamos el ID real para el futuro PATCH
          this.currentUserId = user.id;

          const links = user.social_links || [];
          const withHandles: SocialLinkHandle[] = links.map((l) => ({
            platform: l.platform,
            url: this.extractHandle(l.platform, l.url),
          }));

          this.socialLinksSignal.set(withHandles);
        },
        error: (err) => console.error('Error loading presence:', err),
      });
  }

  /**
   * Guarda los cambios usando el ID real del usuario en la URL
   */
  async savePresence(links: SocialLinkHandle[]): Promise<void> {
    // Verificamos si tenemos el ID. Si no, lo intentamos recuperar antes de fallar.
    if (!this.currentUserId) {
      await firstValueFrom(this.api.get<User>(this.ME_URL)).then(
        (u) => (this.currentUserId = u.id),
      );
    }

    this.loadingSignal.set(true);

    const formattedLinks = links
      .filter((l) => l.url && l.url.trim() !== '')
      .map((l) => ({
        platform: l.platform,
        url: `${this.platformBases[l.platform as keyof typeof environment.socialPlatforms] || ''}${l.url.trim()}`,
      }));

    try {
      /**
       * CONSTRUCCIÓN DE LA URL CON ID REAL:
       * Resultado: http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
       */
      const updateUrl = `${this.USERS_BASE_URL}/${this.currentUserId}`;

      const payload = { social_links: formattedLinks };

      await firstValueFrom(this.api.patch(updateUrl, payload));

      this.socialLinksSignal.set(links);
    } catch (err) {
      console.error('Error saving presence:', err);
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Helper para limpiar URLs
   */
  private extractHandle(platform: string, url: string): string {
    const base = this.platformBases[platform as keyof typeof environment.socialPlatforms];
    if (!base || !url) return url;
    return url.replace(base, '').replace(/\/$/, '');
  }
}
