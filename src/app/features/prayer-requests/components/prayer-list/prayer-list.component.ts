import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PrayerRequest } from '../../models/prayer.model';
import { PrayerCardComponent } from '../prayer-card/prayer-card.component';

@Component({
  selector: 'app-prayer-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrayerCardComponent],
  templateUrl: './prayer-list.component.html',
})
export class PrayerListComponent {
  prayers = input.required<PrayerRequest[]>();
  currentUserId = input<string | null>(null);
  deleteClicked = output<string>();
  editClicked = output<string>();
  viewClicked = output<string>();
}
