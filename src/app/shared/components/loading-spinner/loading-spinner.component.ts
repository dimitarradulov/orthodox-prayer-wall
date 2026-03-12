import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-20 text-gray-500" role="status">
      <span class="text-4xl mb-4" aria-hidden="true">🙏</span>
      <p>Loading prayers...</p>
    </div>
  `,
})
export class LoadingSpinnerComponent {}
