import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, map, startWith, distinctUntilChanged } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return toObservable(supabase.isReady).pipe(
    startWith(supabase.isReady()),
    distinctUntilChanged(),
    filter((ready) => ready === true),
    take(1),
    map(() => {
      if (supabase.userId()) {
        return router.createUrlTree(['/home']);
      }
      return true;
    }),
  );
};
