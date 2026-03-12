import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PrayerRequest } from '../models/prayer.model';
import { RelativeDatePipe } from '../pipes/relative-date.pipe';
import { PrayerRequestService } from '../services/prayer-request.service';

@Component({
  selector: 'app-prayer-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RelativeDatePipe, LoadingSpinnerComponent],
  templateUrl: './prayer-details.page.html',
})
export class PrayerDetailsPage {
  id = input.required<string>();

  private readonly prayerRequestService = inject(PrayerRequestService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly prayer = signal<PrayerRequest | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pendingDelete = signal(false);
  readonly confirmDialog = viewChild<ElementRef<HTMLDialogElement>>('confirmDialog');

  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  readonly isOwner = computed(
    () => !!this.currentUserId() && this.currentUserId() === this.prayer()?.author_id,
  );

  constructor() {
    effect(() => {
      const id = this.id();
      this.loading.set(true);
      this.error.set(null);
      this.prayerRequestService
        .getById(id)
        .then((p) => this.prayer.set(p))
        .catch((err: unknown) =>
          this.error.set(err instanceof Error ? err.message : 'Failed to load prayer'),
        )
        .finally(() => this.loading.set(false));
    });
  }

  async onPray(): Promise<void> {
    const prayer = this.prayer();
    if (!prayer) return;
    await this.prayerRequestService.pray(prayer.id);
    this.prayer.set({ ...prayer, prayer_count: prayer.prayer_count + 1 });
  }

  onDelete(): void {
    this.pendingDelete.set(true);
    this.confirmDialog()?.nativeElement.showModal();
  }

  async confirmDelete(): Promise<void> {
    const p = this.prayer();
    if (p) {
      await this.prayerRequestService.delete(p.id);
    }
    this.closeDialog();
    this.router.navigate(['/']);
  }

  cancelDelete(): void {
    this.closeDialog();
  }

  onDialogClick(event?: MouseEvent): void {
    if (event?.target === this.confirmDialog()?.nativeElement) {
      this.closeDialog();
    }
  }

  private closeDialog(): void {
    this.confirmDialog()?.nativeElement.close();
    this.pendingDelete.set(false);
  }
}
