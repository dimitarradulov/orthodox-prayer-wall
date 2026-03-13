import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PrayerRequestFormService } from '../../services/prayer-request-form.service';

@Component({
  selector: 'app-prayer-request-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './prayer-request-form.component.html',
})
export class PrayerRequestFormComponent implements OnInit {
  readonly initialTitle = input<string>();
  readonly initialDescription = input<string>();
  readonly submitLabel = input('Submit Prayer Request');
  readonly submitting = input(false);

  readonly formSubmitted = output<{ title: string; description: string }>();

  private readonly formService = inject(PrayerRequestFormService);

  protected readonly form = this.formService.createForm();

  ngOnInit(): void {
    const title = this.initialTitle();
    const description = this.initialDescription();
    if (title || description) {
      this.form.patchValue({ title: title ?? '', description: description ?? '' });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmitted.emit(this.form.getRawValue());
  }
}
