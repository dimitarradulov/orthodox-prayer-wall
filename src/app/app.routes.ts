import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/prayer-requests/pages/prayer-feed.page').then((m) => m.PrayerFeedPage),
  },
  {
    path: 'prayer/:id',
    loadComponent: () =>
      import('./features/prayer-requests/pages/prayer-details.page').then(
        (m) => m.PrayerDetailsPage,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
