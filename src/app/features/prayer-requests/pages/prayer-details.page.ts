import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-prayer-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './prayer-details.page.html',
})
export class PrayerDetailsPage {}
