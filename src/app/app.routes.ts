import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { prayerOwnerGuard } from './core/guards/prayer-owner.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/prayer-requests/pages/prayer-feed/prayer-feed.page').then(
        (m) => m.PrayerFeedPage,
      ),
  },
  {
    path: 'prayer-request/:id',
    loadComponent: () =>
      import('./features/prayer-requests/pages/prayer-details/prayer-details.page').then(
        (m) => m.PrayerDetailsPage,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: 'prayer-request/:id/edit',
    canActivate: [authGuard, prayerOwnerGuard],
    loadComponent: () =>
      import('./features/prayer-requests/pages/edit-prayer-request/edit-prayer-request.page').then(
        (m) => m.EditPrayerRequestPage,
      ),
  },
  {
    path: 'new-prayer',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/prayer-requests/pages/new-prayer-request/new-prayer-request.page').then(
        (m) => m.NewPrayerRequestPage,
      ),
  },
  {
    path: 'signin',
    loadComponent: () => import('./core/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
