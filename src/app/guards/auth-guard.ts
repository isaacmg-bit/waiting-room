import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { ToastrService } from 'ngx-toastr';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { filter } from 'rxjs';
import { take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const toast = inject(ToastrService);
  const router = inject(Router);

  return toObservable(supabase.isReady).pipe(
    filter((ready) => ready === true),
    take(1),
    map(() => {
      const currentUserId = supabase.userId();
      if (currentUserId) {
        toast.info('You are already logged in');
        return router.createUrlTree(['/home']);
      }
      return true;
    }),
  );
};
