import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PrayerRequest } from '../models/prayer.model';

@Injectable({ providedIn: 'root' })
export class PrayerRequestService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);

  async retrieveActivePrayerRequests(): Promise<PrayerRequest[]> {
    const { data, error } = await this.supabase
      .from('prayer_requests')
      .select()
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PrayerRequest[];
  }

  async getPage(cursor?: string): Promise<PrayerRequest[]> {
    let query = this.supabase
      .from('prayer_requests')
      .select()
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(30);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as PrayerRequest[];
  }

  async getById(id: string): Promise<PrayerRequest> {
    const { data, error } = await this.supabase
      .from('prayer_requests')
      .select()
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as PrayerRequest;
  }

  async pray(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_prayer_count', { prayer_id: id });
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('prayer_requests').delete().eq('id', id);
    if (error) throw error;
  }

  async create(title: string, description: string) {
    const user = this.auth.user();
    if (!user) throw new Error('User must be authenticated');

    const authorName = this.auth.displayName() ?? 'Anonymous';

    const { data, error } = await this.supabase
      .from('prayer_requests')
      .insert({
        title,
        description,
        author_id: user.id,
        author_name: authorName,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
