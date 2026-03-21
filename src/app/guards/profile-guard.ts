import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { filter } from 'rxjs';
import { take } from 'rxjs';

export const profileGuard: CanActivateFn = () => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);

  return toObservable(supabase.isReady).pipe(
    filter((ready) => ready === true),
    take(1),
    map(() => {
      const currentUserId = supabase.userId();
      if (!currentUserId) {
        return router.createUrlTree(['/login']);
      }
      return true;
    }),
  );
};
