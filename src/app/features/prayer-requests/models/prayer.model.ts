export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  author_id: string;
  author_name: string;
  prayer_count: number;
  status: 'active' | 'answered' | 'archived';
  created_at: Date;
}
