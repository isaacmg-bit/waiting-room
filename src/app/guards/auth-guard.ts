import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const toast = inject(ToastrService);

  const { data } = await supabase.getSession();

  if (data.session) {
    toast.info('You are already logged in');
    return false;
  }

  return true;
};
