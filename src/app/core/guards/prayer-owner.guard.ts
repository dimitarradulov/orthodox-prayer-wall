import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PrayerRequestsStore } from '../../features/prayer-requests/store/prayer-requests.store';

export const prayerOwnerGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const store = inject(PrayerRequestsStore);

  const id = route.paramMap.get('id');
  if (!id) return router.createUrlTree(['/']);

  const prayerRequest = store.prayerRequests().find((request) => request.id === id);

  const userId = auth.user()?.id;
  if (userId && prayerRequest?.author_id === userId) {
    return true;
  }

  return router.createUrlTree(['/prayer-request', id]);
};
