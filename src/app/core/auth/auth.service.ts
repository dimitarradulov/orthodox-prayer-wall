import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '../services/supabase.service';

interface Profile {
  role: string;
  display_name: string | null;
  avatar_url: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly destroyRef = inject(DestroyRef);

  private readonly _user = signal<User | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _profile = signal<Profile | null>(null);

  readonly user = this._user.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._profile()?.role === 'admin');
  readonly displayName = computed(() => this._profile()?.display_name ?? null);
  readonly avatarUrl = computed(() => this._profile()?.avatar_url ?? null);

  constructor() {
    this.supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        this._error.set(error.message);
        return;
      }
      this._user.set(data.user);
      if (data.user) this.loadProfile(data.user);
    });

    const { data } = this.supabase.auth.onAuthStateChange((_, session) => {
      this._user.set(session?.user ?? null);
      this._error.set(null);
      if (session?.user) {
        this.loadProfile(session.user);
      } else {
        this._profile.set(null);
      }
    });

    this.destroyRef.onDestroy(() => data.subscription.unsubscribe());
  }

  private async loadProfile(user: User) {
    await this.supabase.from('profiles').upsert(
      {
        id: user.id,
        display_name: user.user_metadata?.['full_name'] ?? user.user_metadata?.['name'] ?? null,
        avatar_url: user.user_metadata?.['avatar_url'] ?? user.user_metadata?.['picture'] ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    );

    const { data } = await this.supabase.from('profiles').select('*').eq('id', user.id).single();
    this._profile.set(data ?? null);
  }

  async signInWithGoogle() {
    this._error.set(null);
    const { error } = await this.supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) this._error.set(error.message);
  }

  async signOut() {
    this._error.set(null);
    const { error } = await this.supabase.auth.signOut();
    if (error) this._error.set(error.message);
  }
}
