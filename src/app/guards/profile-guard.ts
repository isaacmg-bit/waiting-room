import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';

export const profileGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);

  await supabase.getClient().auth.refreshSession();

  const { data } = await supabase.getSession();
  const session = data.session;

  if (!session) {
    router.navigate(['/login']);
    return false;
  }

  const profileCompleted = localStorage.getItem('profileMinimalCompleted');

  if (!profileCompleted) {
    router.navigate(['/post-login']);
    return false;
  }

  return true;
};
