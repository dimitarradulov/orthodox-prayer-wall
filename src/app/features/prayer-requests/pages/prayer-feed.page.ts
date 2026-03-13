import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { PrayerListComponent } from '../components/prayer-list/prayer-list.component';
import { PrayerRequestService } from '../services/prayer-request.service';
import { PrayerRequestsStore } from '../store/prayer-requests.store';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-prayer-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PrayerListComponent,
    InfiniteScrollDirective,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './prayer-feed.page.html',
})
export class PrayerFeedPage {
  private readonly prayerRequestService = inject(PrayerRequestService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbarService = inject(SnackbarService);
  readonly store = inject(PrayerRequestsStore);

  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  readonly pendingDeleteId = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly confirmDialog = viewChild<ConfirmDialogComponent>('confirmDialog');

  constructor() {
    this.store.loadInitial();
  }

  onView(id: string): void {
    this.router.navigate(['/prayer-request', id]);
  }

  async onPray(id: string): Promise<void> {
    this.actionError.set(null);
    try {
      const wasNew = await this.prayerRequestService.pray(id);
      if (wasNew) {
        const prayer = this.store.requests().find((r) => r.id === id);
        if (prayer) {
          this.store.updateRequest(id, {
            prayer_count: prayer.prayer_count + 1,
            has_prayed: true,
          });
        }
      }
    } catch (err) {
      this.actionError.set(
        err instanceof Error ? err.message : 'Failed to pray. Please try again.',
      );
    }
  }

  onDelete(id: string): void {
    this.pendingDeleteId.set(id);
    this.confirmDialog()?.open();
  }

  async confirmDelete(): Promise<void> {
    const id = this.pendingDeleteId();
    this.actionError.set(null);
    if (id) {
      try {
        await this.prayerRequestService.delete(id);
        this.store.removeRequest(id);
        this.snackbarService.showSuccess('Prayer request deleted successfully.');
      } catch (err) {
        this.actionError.set(
          err instanceof Error ? err.message : 'Failed to delete. Please try again.',
        );
      }
    }
    this.pendingDeleteId.set(null);
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
