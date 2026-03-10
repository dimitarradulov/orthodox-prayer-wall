import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { PrayerListComponent } from '../components/prayer-list/prayer-list.component';
import { PrayerRequestService } from '../services/prayer-request.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-prayer-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrayerListComponent],
  templateUrl: './prayer-feed.page.html',
})
export class PrayerFeedPage {
  private readonly prayerRequestService = inject(PrayerRequestService);
  private readonly auth = inject(AuthService);

  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  readonly pendingDeleteId = signal<string | null>(null);
  readonly confirmDialog = viewChild<ElementRef<HTMLDialogElement>>('confirmDialog');

  readonly prayersResource = resource({
    loader: () => this.prayerRequestService.retrieveActivePrayerRequests(),
  });

  onDelete(id: string): void {
    this.pendingDeleteId.set(id);
    this.confirmDialog()?.nativeElement.showModal();
  }

  async confirmDelete(): Promise<void> {
    const id = this.pendingDeleteId();
    if (id) {
      await this.prayerRequestService.delete(id);
      this.prayersResource.reload();
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
