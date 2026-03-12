import { inject, Injectable, signal } from '@angular/core';
import { PrayerRequestService } from '../services/prayer-request.service';
import { PrayerRequest } from '../models/prayer.model';

@Injectable({ providedIn: 'root' })
export class PrayerRequestsStore {
  private readonly service = inject(PrayerRequestService);

  private readonly _requests = signal<PrayerRequest[]>([]);
  private readonly _loading = signal(false);
  private readonly _cursor = signal<string | null>(null);
  private readonly _hasMore = signal(true);
  private readonly _error = signal<unknown>(null);

  readonly requests = this._requests.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly hasMore = this._hasMore.asReadonly();
  readonly error = this._error.asReadonly();

  async loadInitial(): Promise<void> {
    this._requests.set([]);
    this._cursor.set(null);
    this._hasMore.set(true);
    this._error.set(null);
    this._loading.set(true);
    try {
      const data = await this.service.getPage();
      this._requests.set(data);
      this.setCursor(data);
      this._hasMore.set(data.length === 30);
    } catch (err) {
      this._error.set(err);
    } finally {
      this._loading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    if (this._loading() || !this._hasMore()) return;
    this._loading.set(true);
    try {
      const data = await this.service.getPage(this._cursor() ?? undefined);
      this._requests.update((prev) => [...prev, ...data]);
      this.setCursor(data);
      this._hasMore.set(data.length === 30);
    } catch (err) {
      this._error.set(err);
    } finally {
      this._loading.set(false);
    }
  }

  removeRequest(id: string): void {
    this._requests.update((list) => list.filter((r) => r.id !== id));
  }

  private setCursor(data: PrayerRequest[]): void {
    this._cursor.set(data.length > 0 ? data[data.length - 1].created_at : null);
  }
}
