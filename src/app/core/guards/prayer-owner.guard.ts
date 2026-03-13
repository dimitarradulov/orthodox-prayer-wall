import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../services/supabase.service';

export const prayerOwnerGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const supabase = inject(SupabaseService).client;
  const auth = inject(AuthService);
  const router = inject(Router);

  const id = route.paramMap.get('id');
  if (!id) return router.createUrlTree(['/']);

  const { data } = await supabase.from('prayer_requests').select('author_id').eq('id', id).single();

  const userId = auth.user()?.id;
  if (userId && data?.author_id === userId) {
    return true;
  }

  return router.createUrlTree(['/prayer-request', id]);
};
