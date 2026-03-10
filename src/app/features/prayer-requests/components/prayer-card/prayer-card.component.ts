import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PrayerRequest } from '../../models/prayer.model';
import { RelativeDatePipe } from '../../pipes/relative-date.pipe';

@Component({
  selector: 'app-prayer-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './prayer-card.component.html',
  imports: [RelativeDatePipe],
})
export class PrayerCardComponent {
  prayer = input.required<PrayerRequest>();
  prayerClicked = output<string>();

  onPray(): void {
    this.prayerClicked.emit(this.prayer().id);
  }
}
