import { Injectable, signal, inject } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.prod';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly router = inject(Router);
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );

  userRole = signal<'user' | 'admin' | null>(null);
  userId = signal<string | null>(null);
  public isReady = signal(false);
  isLoading = signal<boolean>(true);

  constructor() {
    this.initAuthListener();
  }

  private async initAuthListener() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    await this.handleAuthChange(session);

    this.isReady.set(true);
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      await this.handleAuthChange(session);
    });
  }
  private async handleAuthChange(session: Session | null) {
    if (session?.user) {
      this.userId.set(session.user.id);
      await this.loadUserRole(session.user.id);
    } else {
      this.userId.set(null);
      this.userRole.set(null);
    }
    this.isLoading.set(false);
  }

  getClient() {
    return this.supabase;
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  async signUp(email: string, password: string) {
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
    this.userRole.set(null);
    this.userId.set(null);
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

  async loadUserRole(userId: string) {
    this.userId.set(userId);

    const { data, error } = await this.supabase
      .from('user_profile')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading user role:', error);
      this.userRole.set('user');
      return;
    }

    this.userRole.set(data?.role || 'user');
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
