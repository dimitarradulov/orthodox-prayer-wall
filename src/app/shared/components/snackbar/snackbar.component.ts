import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSnackBarLabel, MatSnackBarActions, MatButton],
  template: `
    <article class="flex">
      <span matSnackBarLabel>{{ data.message }}</span>
      <span matSnackBarActions>
        <button matButton aria-label="Close notification" (click)="ref.dismiss()">X</button>
      </span>
    </article>
  `,
})
export class SnackbarComponent {
  readonly data = inject<{ message: string }>(MAT_SNACK_BAR_DATA);
  readonly ref = inject(MatSnackBarRef);
}
