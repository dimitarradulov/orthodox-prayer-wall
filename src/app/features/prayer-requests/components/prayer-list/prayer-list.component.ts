import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Prayer } from '../../models/prayer.model';
import { PrayerCardComponent } from '../prayer-card/prayer-card.component';

@Component({
  selector: 'app-prayer-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrayerCardComponent],
  templateUrl: './prayer-list.component.html',
})
export class PrayerListComponent {
  prayers = input.required<Prayer[]>();
}
