import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PrayerRequest } from '../models/prayer.model';
import { RelativeDatePipe } from '../pipes/relative-date.pipe';
import { PrayerRequestService } from '../services/prayer-request.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-prayer-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RelativeDatePipe, LoadingSpinnerComponent, ConfirmDialogComponent],
  templateUrl: './prayer-details.page.html',
})
export class PrayerDetailsPage {
  id = input.required<string>();

  private readonly prayerRequestService = inject(PrayerRequestService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbarService = inject(SnackbarService);

  readonly prayer = signal<PrayerRequest | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly confirmDialog = viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  readonly isOwner = computed(
    () => !!this.currentUserId() && this.currentUserId() === this.prayer()?.author_id,
  );
  readonly hasPrayed = computed(() => this.prayer()?.has_prayed ?? false);

  constructor() {
    effect(() => {
      const id = this.id();
      this.loading.set(true);
      this.error.set(null);

      this.prayerRequestService
        .getById(id)
        .then((p) => {
          if (this.id() === id) {
            this.prayer.set(p);
          }
        })
        .catch((err: unknown) => {
          if (this.id() === id) {
            this.error.set(err instanceof Error ? err.message : 'Failed to load prayer');
          }
        })
        .finally(() => {
          if (this.id() === id) {
            this.loading.set(false);
          }
        });
    });
  }

  async onPray(): Promise<void> {
    const prayer = this.prayer();
    if (!prayer) return;
    this.error.set(null);
    try {
      const wasNew = await this.prayerRequestService.pray(prayer.id);
      if (wasNew) {
        this.prayer.set({ ...prayer, prayer_count: prayer.prayer_count + 1, has_prayed: true });
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to pray. Please try again.');
    }
  }

  onDelete(): void {
    this.confirmDialog()?.open();
  }

  async confirmDelete(): Promise<void> {
    const p = this.prayer();
    this.error.set(null);
    if (p) {
      try {
        await this.prayerRequestService.delete(p.id);
        this.snackbarService.showSuccess('Prayer request deleted successfully.');
        this.router.navigate(['/']);
      } catch (err) {
        this.error.set(err instanceof Error ? err.message : 'Failed to delete. Please try again.');
      }
    }
  }

  cancelDelete(): void {
    // dialog closed by ConfirmDialogComponent
  }
}
