import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Prayer } from '../../models/prayer.model';

@Component({
  selector: 'app-prayer-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './prayer-card.component.html',
})
export class PrayerCardComponent {
  prayer = input.required<Prayer>();
  prayerClicked = output<string>();

  getRelativeDate(date: Date): string {
    const now = new Date('2026-03-09');
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  onPray(): void {
    this.prayerClicked.emit(this.prayer().id);
  }
}
