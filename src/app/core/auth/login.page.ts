import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.page.html',
})
export class LoginPage {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.router.navigate(['/']);
      }
    });
  }

  login(): void {
    this.authService.signInWithGoogle();
  }
}
