import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );

  readonly userId = signal<string | null>(null);
  readonly userRole = signal<'user' | 'admin' | null>(null);
  readonly isReady = signal<boolean>(false);

  private currentSession: Session | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    this.currentSession = session;
    this.applySession(session);
    this.isReady.set(true);

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      this.currentSession = session;

      if (event === 'SIGNED_OUT') {
        this.userId.set(null);
        this.userRole.set(null);

        return;
      }

      this.applySession(session);

      if (event === 'SIGNED_IN') {
        this.isReady.set(true);
      }
    });
  }

  private async applySession(session: Session | null): Promise<void> {
    if (!session?.user) {
      this.userId.set(null);
      this.userRole.set(null);
      return;
    }

    this.userId.set(session.user.id);
    await this.loadUserRole(session.user.id);
  }

  async loadUserRole(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('user_profile')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      this.userRole.set('user');
      return;
    }

    this.userRole.set(data?.role ?? 'user');
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getStoredSession(): Session | null {
    return this.currentSession;
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: '/post-login' },
    });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  setSession(access_token: string, refresh_token: string) {
    return this.supabase.auth.setSession({ access_token, refresh_token });
  }

  setSessionFromFragment(fragment: string | null): void {
    if (!fragment) return;
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token) return;
    this.setSession(access_token, refresh_token ?? '');
  }

  updatePassword(password: string) {
    return this.supabase.auth.updateUser({ password });
  }

  resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${environment.appUrl}${environment.apiResetPass}`,
    });
  }
}
