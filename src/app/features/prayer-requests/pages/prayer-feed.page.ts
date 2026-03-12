import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { PrayerListComponent } from '../components/prayer-list/prayer-list.component';
import { PrayerRequestService } from '../services/prayer-request.service';
import { PrayerRequestsStore } from '../store/prayer-requests.store';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-prayer-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrayerListComponent, InfiniteScrollDirective, LoadingSpinnerComponent],
  templateUrl: './prayer-feed.page.html',
})
export class PrayerFeedPage {
  private readonly prayerRequestService = inject(PrayerRequestService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly store = inject(PrayerRequestsStore);

  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  readonly pendingDeleteId = signal<string | null>(null);
  readonly confirmDialog = viewChild<ElementRef<HTMLDialogElement>>('confirmDialog');

  constructor() {
    this.store.loadInitial();
  }

  onView(id: string): void {
    this.router.navigate(['/prayer-request', id]);
  }

  async onPray(id: string): Promise<void> {
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
  }

  onDelete(id: string): void {
    this.pendingDeleteId.set(id);
    this.confirmDialog()?.nativeElement.showModal();
  }

  async confirmDelete(): Promise<void> {
    const id = this.pendingDeleteId();
    if (id) {
      await this.prayerRequestService.delete(id);
      this.store.removeRequest(id);
    }
    this.closeDialog();
  }

  cancelDelete(): void {
    this.closeDialog();
  }

  onDialogClick(event?: MouseEvent): void {
    const dialog = this.confirmDialog()?.nativeElement;
    if (event?.target === dialog) {
      this.closeDialog();
    }
  }

  private closeDialog(): void {
    this.confirmDialog()?.nativeElement.close();
    this.pendingDeleteId.set(null);
  }
}
