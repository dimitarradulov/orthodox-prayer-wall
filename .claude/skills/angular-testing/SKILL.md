---
name: angular-testing
description: Create unit tests in Angular v20+ using the CLI-integrated Vitest runner. Use for writing or updating *.spec.ts and *.test.ts for standalone components, services, guards, routing, HTTP, and signal-driven state. Triggers on adding coverage for Angular logic, migrating Karma or Jasmine specs to Vitest, or setting up shared Angular test providers. Do not use for e2e, browser automation, or Playwright tests.
---

# Angular Unit Testing with Vitest

Write focused unit tests for Angular v20+ using Angular's built-in test environment and the default Vitest runner. Prefer Angular testing APIs like `TestBed`, `RouterTestingHarness`, and `HttpTestingController` over mocking Angular internals.

## Default Assumptions

- Angular CLI projects use the `@angular/build:unit-test` builder.
- `ng test` runs Vitest with `jsdom` by default.
- Specs live beside source files as `*.spec.ts` or `*.test.ts`.
- `tsconfig.spec.json` should include `vitest/globals` in `compilerOptions.types`.
- Add a custom Vitest config only when the Angular test target options are not enough.

## Core Rules

- Test public behavior, rendered output, navigation results, and DI interactions instead of private implementation details.
- For standalone components, add the component to `imports`, not `declarations`.
- Prefer real Angular providers with small test doubles for app-specific dependencies.
- Do not mock Angular Router directly. Use `provideRouter(...)` and `RouterTestingHarness`.
- For `HttpClient` code, use `provideHttpClient()` together with `provideHttpClientTesting()`.
- When signal effects or async model-to-view updates need to settle, call `TestBed.tick()`.
- Avoid `TestBed.flushEffects()` in new tests because it is deprecated.
- Only call `compileComponents()` when the test actually needs it, such as components using `@defer`.
- Restore or clear Vitest mocks between tests.

## Component Tests

Use a small `setup()` helper when the test needs custom inputs or providers.

```typescript
import { TestBed } from '@angular/core/testing';
import { PrayerCardComponent } from './prayer-card.component';

describe('PrayerCardComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [PrayerCardComponent],
    });

    const fixture = TestBed.createComponent(PrayerCardComponent);
    return {
      fixture,
      component: fixture.componentInstance,
    };
  }

  it('renders the prayer title', () => {
    const { fixture } = setup();

    fixture.componentRef.setInput('title', 'For peace');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('For peace');
  });
});
```

### Component Testing Rules

- Use `fixture.componentRef.setInput(...)` for `input()` signals.
- Prefer asserting on DOM output for template behavior and on the component instance for pure logic.
- Use `fixture.nativeElement` for straightforward DOM assertions.
- Use `fixture.debugElement` and `By.css(...)` only when Angular-specific queries are useful.
- Call `await fixture.whenStable()` or `TestBed.tick()` when async work must complete before asserting.

## Outputs and User Interaction

For `output()` signals, subscribe to the emitter or bridge it to a Vitest spy.

```typescript
it('emits when the button is clicked', () => {
  TestBed.configureTestingModule({
    imports: [PrayerCardComponent],
  });

  const fixture = TestBed.createComponent(PrayerCardComponent);
  const emitted = vi.fn();

  fixture.componentInstance.opened.subscribe(emitted);
  fixture.nativeElement.querySelector('button').click();

  expect(emitted).toHaveBeenCalledTimes(1);
});
```

## Service Tests

Use `TestBed.inject(...)` for Angular services, especially when the service depends on DI.

```typescript
import { TestBed } from '@angular/core/testing';
import { vi, type Mocked } from 'vitest';
import { ProfileService } from './profile.service';
import { ApiClient } from './api-client.service';

describe('ProfileService', () => {
  const apiClient: Mocked<ApiClient> = {
    loadProfile: vi.fn(),
  } as Mocked<ApiClient>;

  let service: ProfileService;

  beforeEach(() => {
    apiClient.loadProfile.mockReset();

    TestBed.configureTestingModule({
      providers: [ProfileService, { provide: ApiClient, useValue: apiClient }],
    });

    service = TestBed.inject(ProfileService);
  });

  it('delegates to ApiClient', async () => {
    apiClient.loadProfile.mockResolvedValue({ id: 'u1', displayName: 'Mina' });

    await expect(service.load()).resolves.toEqual({
      id: 'u1',
      displayName: 'Mina',
    });
    expect(apiClient.loadProfile).toHaveBeenCalledTimes(1);
  });
});
```

### Service Testing Rules

- If a service is `providedIn: 'root'` and has no custom dependencies, `TestBed.inject(MyService)` is usually enough.
- Replace slow or non-deterministic dependencies with typed stubs or spies.
- Use `vi.fn()` for fake implementations and interaction assertions.
- Prefer typed doubles such as `Mocked<MyDependency>` when the dependency shape is stable.

## HTTP Service Tests

Use Angular's HTTP testing utilities instead of mocking `HttpClient` directly.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PrayerApi } from './prayer-api.service';

describe('PrayerApi', () => {
  let service: PrayerApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrayerApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PrayerApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads prayer requests', () => {
    let result: unknown;

    service.list().subscribe((value) => {
      result = value;
    });

    const request = httpTesting.expectOne('/api/prayer-requests');
    expect(request.request.method).toBe('GET');

    request.flush([{ id: '1', title: 'For peace' }]);

    expect(result).toEqual([{ id: '1', title: 'For peace' }]);
  });
});
```

### HTTP Testing Rules

- Always verify outstanding requests in `afterEach()`.
- Assert the request method, URL, and body before flushing.
- Flush realistic response payloads instead of minimal placeholders.
- Test error paths with `request.flush(..., { status, statusText })` when the service handles failures.

## Router and Guard Tests

Use the real router with `RouterTestingHarness`.

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthStore } from './auth.store';

@Component({ template: '<h1>Protected</h1>' })
class ProtectedPage {}

@Component({ template: '<h1>Login</h1>' })
class LoginPage {}

describe('authGuard', () => {
  it('redirects anonymous users to login', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: { isAuthenticated: vi.fn().mockReturnValue(false) } },
        provideRouter([
          { path: 'protected', component: ProtectedPage, canActivate: [authGuard] },
          { path: 'login', component: LoginPage },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/protected', LoginPage);

    expect(harness.routeNativeElement?.textContent).toContain('Login');
  });
});
```

### Router Testing Rules

- Do not replace the router with a hand-written mock.
- Use `provideRouter(...)` with the smallest route table that exercises the behavior.
- Use `await harness.navigateByUrl(...)` for route parameters, redirects, guards, and outlet rendering.
- Assert on the rendered route content or returned component instance.

## Signals and Async State

Signal-based code is usually easiest to test by updating state and synchronizing the fixture.

```typescript
it('updates computed state after a signal change', () => {
  TestBed.configureTestingModule({
    imports: [ProfilePage],
  });

  const fixture = TestBed.createComponent(ProfilePage);
  fixture.componentInstance.user.set({ name: 'Anna' });

  TestBed.tick();
  fixture.detectChanges();

  expect(fixture.nativeElement.textContent).toContain('Anna');
});
```

### Signal Testing Rules

- Assert on public computed state or rendered output, not private signal internals.
- Use `TestBed.tick()` when effects or async model-to-view synchronization must complete.
- Use `fixture.detectChanges()` after state changes that affect the template.
- Keep signal tests synchronous where possible.

## Vitest Mocking Patterns

Vitest is responsible for spies, module mocks, and fake timers. Angular is responsible for DI, DOM rendering, and change detection.

```typescript
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
```

### Mocking Rules

- Use `vi.fn()` for dependency doubles created inside the spec.
- Use `vi.spyOn(object, 'method')` when keeping most of the real object behavior.
- Remember that `vi.mock(...)` is hoisted.
- Reset mocked dates, timers, globals, and env vars after each test.

## Global Test Setup

Prefer Angular test target options over repetitive per-spec setup.

- Use `setupFiles` for shared polyfills and global mocks.
- Use `providersFile` for shared Angular providers, such as test HTTP providers.
- Use `runnerConfig` only for advanced Vitest configuration that Angular's builder cannot express.
- If you add support files, make sure `tsconfig.spec.json` includes them.

## Migration Notes from Jasmine or Karma

- Replace Jasmine spies with `vi.fn()` or `vi.spyOn(...)`.
- Keep Angular utilities like `TestBed`, `fakeAsync`, and `waitForAsync` when they still fit the test.
- Replace Jasmine-specific matchers with Vitest-compatible `expect(...)` assertions.
- Keep existing spec filenames when possible so the builder still discovers them.

## Workflow for Agents

When asked to create or update Angular unit tests:

1. Read the source file and any nearby `*.spec.ts` before writing a new test.
2. Extend the nearest existing spec unless there is a strong reason to split coverage.
3. Use Angular testing utilities first and add Vitest mocks only for app dependencies.
4. Keep each test focused on one behavior.
5. Run `ng test --no-watch` or the workspace test script after changes.

## Avoid

- Mocking Angular framework services when a real test provider exists.
- Re-implementing router behavior with stubs.
- Testing every private helper through the component instead of extracting and testing real public logic.
- Snapshot testing by default.
- Broad, brittle assertions like checking the entire rendered HTML string.
