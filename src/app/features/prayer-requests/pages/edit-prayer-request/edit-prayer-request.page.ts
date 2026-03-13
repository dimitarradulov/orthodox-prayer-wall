import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PrayerRequest } from '../../models/prayer.model';
import { PrayerRequestService } from '../../services/prayer-request.service';
import { PrayerRequestFormComponent } from '../../components/prayer-request-form/prayer-request-form.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-edit-prayer-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrayerRequestFormComponent, LoadingSpinnerComponent],
  templateUrl: './edit-prayer-request.page.html',
})
export class EditPrayerRequestPage {
  id = input.required<string>();

  private readonly prayerRequestService = inject(PrayerRequestService);
  private readonly router = inject(Router);

  protected readonly prayer = signal<PrayerRequest | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.id();
      this.loading.set(true);
      this.errorMessage.set(null);

      this.prayerRequestService
        .getById(id)
        .then((p) => {
          if (this.id() === id) this.prayer.set(p);
        })
        .catch((err: unknown) => {
          if (this.id() === id) {
            this.errorMessage.set(err instanceof Error ? err.message : 'Failed to load prayer.');
          }
        })
        .finally(() => {
          if (this.id() === id) this.loading.set(false);
        });
    });
  }

  protected async onSubmit({
    title,
    description,
  }: {
    title: string;
    description: string;
  }): Promise<void> {
    this.submitting.set(true);
    this.errorMessage.set(null);
    try {
      await this.prayerRequestService.update(this.id(), title, description);
      this.router.navigate(['/']);
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Failed to update prayer request.',
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
