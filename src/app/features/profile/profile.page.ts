import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-2xl px-4 py-10">
      <h1 class="font-title text-3xl font-bold text-primary">My Profile</h1>
    </main>
  `,
})
export class ProfilePage {}
