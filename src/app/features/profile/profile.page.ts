import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { AuthService } from '../../core/auth/auth.service';
import { PrayerRequestService } from '../prayer-requests/services/prayer-request.service';
import { PrayerRequest } from '../prayer-requests/models/prayer.model';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatSort, MatSortHeader, ConfirmDialogComponent, LoadingSpinnerComponent],
  templateUrl: './profile.page.html',
})
export class ProfilePage {
  protected readonly auth = inject(AuthService);
  private readonly prayerRequestService = inject(PrayerRequestService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);
  protected readonly confirmDialog = viewChild<ConfirmDialogComponent>('confirmDialog');

  protected readonly requests = signal<PrayerRequest[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly pendingDeleteId = signal<string | null>(null);
  private readonly _sort = signal<Sort>({ active: 'created_at', direction: 'desc' });

  readonly sortedRequests = computed(() => {
    const { active, direction } = this._sort();
    const list = [...this.requests()];
    if (!direction) return list;
    return list.sort((a, b) => {
      let cmp = 0;
      if (active === 'title') cmp = a.title.localeCompare(b.title);
      else if (active === 'created_at') cmp = a.created_at.localeCompare(b.created_at);
      else if (active === 'prayer_count') cmp = a.prayer_count - b.prayer_count;
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  constructor() {
    effect(() => {
      const userId = this.auth.user()?.id;
      if (!userId) return;
      this.loading.set(true);
      this.error.set(null);
      this.prayerRequestService
        .getByAuthor(userId)
        .then((data) => {
          if (this.auth.user()?.id === userId) this.requests.set(data);
        })
        .catch((err: unknown) => {
          if (this.auth.user()?.id === userId)
            this.error.set(err instanceof Error ? err.message : 'Failed to load your requests.');
        })
        .finally(() => {
          if (this.auth.user()?.id === userId) this.loading.set(false);
        });
    });
  }

  onView(id: string): void {
    this.router.navigate(['/prayer-request', id]);
  }

  onEdit(id: string): void {
    this.router.navigate(['/prayer-request', id, 'edit']);
  }

  onDelete(id: string): void {
    this.pendingDeleteId.set(id);
    this.confirmDialog()?.open();
  }

  async confirmDelete(): Promise<void> {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.error.set(null);
    try {
      await this.prayerRequestService.delete(id);
      this.requests.update((list) => list.filter((r) => r.id !== id));
      this.snackbar.showSuccess('Prayer request deleted.');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      this.pendingDeleteId.set(null);
    }
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  async onStatusChange(id: string, event: Event): Promise<void> {
    const status = (event.target as HTMLSelectElement).value as PrayerRequest['status'];
    const valid: PrayerRequest['status'][] = ['active', 'answered', 'archived'];
    if (!valid.includes(status)) return;
    this.error.set(null);
    try {
      await this.prayerRequestService.updateStatus(id, status);
      this.requests.update((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
      this.snackbar.showSuccess('Status updated.');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to update status.');
    }
  }

  onSortChange(sort: Sort): void {
    this._sort.set(sort);
  }
}
