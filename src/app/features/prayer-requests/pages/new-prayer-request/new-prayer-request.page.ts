import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PrayerRequestService } from '../../services/prayer-request.service';
import { PrayerRequestFormComponent } from '../../components/prayer-request-form/prayer-request-form.component';

@Component({
  selector: 'app-new-prayer-request',
  imports: [PrayerRequestFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-prayer-request.page.html',
})
export class NewPrayerRequestPage {
  private readonly router = inject(Router);
  private readonly prayerRequestService = inject(PrayerRequestService);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

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
      await this.prayerRequestService.create(title, description);
      this.router.navigate(['/']);
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Failed to submit prayer request.',
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
