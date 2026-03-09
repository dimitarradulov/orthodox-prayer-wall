import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Prayer } from '../models/prayer.model';
import { PrayerListComponent } from '../components/prayer-list/prayer-list.component';

@Component({
  selector: 'app-prayer-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrayerListComponent],
  templateUrl: './prayer-feed.page.html',
})
export class PrayerFeedPage {
  readonly prayers = signal<Prayer[]>([
    {
      id: '1',
      name: 'Maria',
      request: 'Please pray for my mother recovering from surgery...',
      prayerCount: 14,
      createdAt: new Date('2026-03-07'),
      category: 'Health',
    },
    {
      id: '2',
      name: 'Anonymous',
      request: 'Lord, grant peace to our family during this difficult time...',
      prayerCount: 8,
      createdAt: new Date('2026-03-08'),
      category: 'Family',
    },
    {
      id: '3',
      name: 'Alexei',
      request: 'Thanksgiving for the safe arrival of our newborn son...',
      prayerCount: 23,
      createdAt: new Date('2026-03-09'),
      category: 'Thanksgiving',
    },
  ]);
}
