import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
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
  currentUserId = input<string | null>(null);
  prayerClicked = output<string>();
  deleteClicked = output<string>();
  editClicked = output<string>();

  isOwner = computed(
    () => !!this.currentUserId() && this.currentUserId() === this.prayer().author_id,
  );

  onPray(): void {
    this.prayerClicked.emit(this.prayer().id);
  }

  onDelete(): void {
    this.deleteClicked.emit(this.prayer().id);
  }

  onEdit(): void {
    this.editClicked.emit(this.prayer().id);
  }
}
