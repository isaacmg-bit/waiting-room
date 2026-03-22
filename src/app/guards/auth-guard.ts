import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, map, switchMap } from 'rxjs';
import { from } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return toObservable(supabase.isReady).pipe(
    filter(Boolean),
    take(1),
    switchMap(() => from(supabase.getSession())),
    map(({ data }) => {
      if (data.session) {
        return router.createUrlTree(['/home']);
      }
      return true;
    }),
  );
};
