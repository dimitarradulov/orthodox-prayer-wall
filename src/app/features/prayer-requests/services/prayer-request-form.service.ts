import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class PrayerRequestFormService {
  private fb = inject(FormBuilder);

  createForm() {
    return this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
    });
  }
}
