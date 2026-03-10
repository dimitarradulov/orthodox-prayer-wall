import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { PrayerListComponent } from '../components/prayer-list/prayer-list.component';
import { PrayerRequestService } from '../services/prayer-request.service';

@Component({
  selector: 'app-prayer-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrayerListComponent],
  templateUrl: './prayer-feed.page.html',
})
export class PrayerFeedPage {
  private readonly prayerRequestService = inject(PrayerRequestService);

  readonly prayersResource = resource({
    loader: () => this.prayerRequestService.retrieveActivePrayerRequests(),
  });
}
