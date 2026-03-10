import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrayerRequestService } from '../../services/prayer-request.service';

@Component({
  selector: 'app-new-prayer-request',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-prayer-request.page.html',
})
export class NewPrayerRequestPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly prayerRequestService = inject(PrayerRequestService);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  protected async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const { title, description } = this.form.getRawValue();
      await this.prayerRequestService.create(title, description);
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit prayer request.';
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }
}
