import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { UserService } from '../services/user-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, firstValueFrom, startWith, distinctUntilChanged, take } from 'rxjs';

export const profileGuard: CanActivateFn = () => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);
  const userService = inject(UserService);

  return toObservable(supabase.isReady).pipe(
    startWith(supabase.isReady()),
    distinctUntilChanged(),
    filter((ready) => ready === true),
    take(1),
    switchMap(async () => {
      if (!supabase.userId()) {
        return router.createUrlTree(['/login']);
      }

      try {
        const user = await firstValueFrom(userService.getMe());

        if (!user.name || !user.location) {
          return router.createUrlTree(['/post-login']);
        }

        return true;
      } catch {
        return router.createUrlTree(['/login']);
      }
    }),
  );
};
