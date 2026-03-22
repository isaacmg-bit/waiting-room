import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user-service';
import { switchMap, firstValueFrom, take, filter } from 'rxjs';

export const profileGuard: CanActivateFn = () => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);
  const userService = inject(UserService);

  return toObservable(supabase.isReady).pipe(
    filter((ready) => ready === true),
    take(1),
    switchMap(async () => {
      const currentUserId = supabase.userId();

      if (!currentUserId) {
        return router.createUrlTree(['/login']);
      }

      const user = await firstValueFrom(userService.getMe());

      if (!user.name || !user.location) {
        return router.createUrlTree(['/post-login']);
      }

      return true;
    }),
  );
};
