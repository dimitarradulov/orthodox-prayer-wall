import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PrayerRequest } from '../models/prayer.model';
import { PrayerListComponent } from '../components/prayer-list/prayer-list.component';

@Component({
  selector: 'app-prayer-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrayerListComponent],
  templateUrl: './prayer-feed.page.html',
})
export class PrayerFeedPage {
  readonly prayers = signal<PrayerRequest[]>([
    {
      id: '1',
      title: 'Healing for my mother',
      description: 'Please pray for my mother recovering from surgery...',
      author_id: 'user-1',
      author_name: 'Maria',
      prayer_count: 14,
      status: 'active',
      created_at: new Date('2026-03-07'),
    },
    {
      id: '2',
      title: 'Peace for our family',
      description: 'Lord, grant peace to our family during this difficult time...',
      author_id: 'user-2',
      author_name: 'Anonymous',
      prayer_count: 8,
      status: 'active',
      created_at: new Date('2026-03-08'),
    },
    {
      id: '3',
      title: 'Thanksgiving for newborn',
      description: 'Thanksgiving for the safe arrival of our newborn son...',
      author_id: 'user-3',
      author_name: 'Alexei',
      prayer_count: 23,
      status: 'active',
      created_at: new Date('2026-03-09'),
    },
  ]);
}
