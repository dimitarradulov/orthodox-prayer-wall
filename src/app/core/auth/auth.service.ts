import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly destroyRef = inject(DestroyRef);

  private readonly _user = signal<User | null>(null);
  private readonly _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  constructor() {
    this.supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        this._error.set(error.message);
        return;
      }
      this._user.set(data.user);
    });

    const { data } = this.supabase.auth.onAuthStateChange((_, session) => {
      this._user.set(session?.user ?? null);
      this._error.set(null);
    });

    this.destroyRef.onDestroy(() => data.subscription.unsubscribe());
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
