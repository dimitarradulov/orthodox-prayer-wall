import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { LoginPage } from './login.page';
import { AuthService } from './auth.service';

function createAuthServiceStub() {
  return {
    isLoggedIn: signal(false),
    error: signal<string | null>(null),
    signInWithGoogle: vi.fn(),
  };
}

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let authStub: ReturnType<typeof createAuthServiceStub>;
  let router: Router;

  beforeEach(async () => {
    authStub = createAuthServiceStub();

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        { provide: AuthService, useValue: authStub },
        provideRouter([{ path: '', component: LoginPage }]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call signInWithGoogle when login button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(authStub.signInWithGoogle).toHaveBeenCalled();
  });

  it('should navigate to "/" when user is logged in', fakeAsync(() => {
    const navSpy = vi.spyOn(router, 'navigate');
    authStub.isLoggedIn.set(true);

    fixture.detectChanges();
    tick();

    expect(navSpy).toHaveBeenCalledWith(['/']);
  }));
});
