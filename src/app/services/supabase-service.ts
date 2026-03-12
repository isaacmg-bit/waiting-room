import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );

  getClient() {
    return this.supabase;
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
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
