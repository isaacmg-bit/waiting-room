import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);

  const { data } = await supabase.getSession();

  if (data.session) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
