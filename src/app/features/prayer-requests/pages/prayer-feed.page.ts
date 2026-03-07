import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-prayer-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './prayer-feed.page.html',
})
export class PrayerFeedPage {}
