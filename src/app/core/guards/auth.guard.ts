import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService).client;
  const router = inject(Router);

  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
