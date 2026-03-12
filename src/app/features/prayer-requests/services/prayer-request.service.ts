import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PrayerRequest } from '../models/prayer.model';
import { PAGE_SIZE } from '../prayer-requests.constants';

@Injectable({ providedIn: 'root' })
export class PrayerRequestService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);

  async getPage(cursor?: string): Promise<PrayerRequest[]> {
    let query = this.supabase
      .from('prayer_requests')
      .select('*, prayers(id)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as (PrayerRequest & { prayers: { id: string }[] })[]).map(
      ({ prayers, ...row }) => ({ ...row, has_prayed: (prayers?.length ?? 0) > 0 }),
    );
  }

  async getById(id: string): Promise<PrayerRequest> {
    const { data, error } = await this.supabase
      .from('prayer_requests')
      .select('*, prayers(id)')
      .eq('id', id)
      .single();
    if (error) throw error;
    const { prayers, ...row } = data as PrayerRequest & { prayers: { id: string }[] };
    return { ...row, has_prayed: (prayers?.length ?? 0) > 0 };
  }

  async pray(id: string): Promise<boolean> {
    const { data } = await this.supabase.rpc('pray_for_request', { p_request_id: id });
    return !!data;
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
