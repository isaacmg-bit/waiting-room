import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { UserService } from '../services/user-service';
import { firstValueFrom } from 'rxjs';

export const profileGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);
  const userService = inject(UserService);

  const { data } = await supabase.getSession();

  if (!data.session) {
    router.navigate(['/login']);
    return false;
  }

  const user = await firstValueFrom(userService.getMe());

  if (!user.name) {
    router.navigate(['/post-login']);
    return false;
  }

  return true;
};
