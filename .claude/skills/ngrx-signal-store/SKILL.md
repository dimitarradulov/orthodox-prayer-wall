---
name: ngrx-signal-store
description: >
  Best practices for building NgRx Signal Stores in Angular v19+. Use this skill whenever the
  user is creating, refactoring, or extending a signalStore — including adding entity management,
  async operations, custom features, call state, computed signals, rxMethod pipelines, or deciding
  how to provide/scope a store. Trigger on any mention of signalStore, withState, withEntities,
  withMethods, withComputed, withHooks, rxMethod, patchState, or NgRx signals in general.
---

# NgRx Signal Store — Best Practices

## 1. Feature Ordering (enforced by TypeScript types)

Always compose features in this order:

```
withEntities / withState  →  withCallState  →  withProps  →  withComputed  →  withMethods  →  withHooks
```

`withMethods` and `withComputed` need previous features to already be in scope. `withHooks` always goes last because it needs the full store.

## 2. Store Skeleton

```typescript
export const BooksStore = signalStore(
  { providedIn: 'root', protectedState: true },
  withEntities(bookConfig), // or withState({...})
  withCallState(), // before withMethods
  withComputed(({ bookEntities }) => ({
    hasBooks: computed(() => bookEntities().length > 0),
  })),
  withMethods((store, service = inject(BookService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap(() =>
          service.getAll().pipe(
            tapResponse({
              next: (books) => patchState(store, setAllEntities(books, bookConfig), setLoaded()),
              error: (err: HttpErrorResponse) => patchState(store, setError(err.message)),
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks((store) => ({
    onInit() {
      store.load();
    },
  })),
);
```

## 3. Entity Management

Always use `entityConfig` — it keeps ID selection and collection name in one place and is reusable across all updaters:

```typescript
const bookConfig = entityConfig({
  entity: type<Book>(),
  collection: 'book', // produces bookEntityMap, bookIds, bookEntities
  selectId: (b) => b.isbn, // only needed when ID is not `id`
});

withEntities(bookConfig);
// then reuse bookConfig in every patchState call:
patchState(store, setAllEntities(books, bookConfig));
patchState(store, addEntity(book, bookConfig));
patchState(store, updateEntity({ id, changes }, bookConfig));
patchState(store, removeEntity(id, bookConfig));
```

For **multiple entity types** in one store, each `withEntities` call must have a unique `collection` name. Signals are then prefixed: `bookEntities`, `authorEntities`, etc.

## 4. Async Operations with rxMethod

`rxMethod` is the right tool for any async or reactive operation. It accepts a static value, a Signal, or an Observable — all handled transparently.

```typescript
load: rxMethod<string>(
  pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => patchState(store, setLoading())),
    switchMap((query) =>
      service.search(query).pipe(
        tapResponse({
          next: (items) => patchState(store, setAllEntities(items, config), setLoaded()),
          error: (err: HttpErrorResponse) => patchState(store, setError(err.message)),
        }),
      ),
    ),
  ),
);
```

**Always use `tapResponse`** (from `@ngrx/operators`) — raw `catchError` completes the outer observable, breaking future calls. `tapResponse` keeps the stream alive.

**Do not** nest `rxMethod` inside another `rxMethod`.

For promise-based services, wrap with `from()`:

```typescript
switchMap(() => from(service.getAll()).pipe(tapResponse(...)))
```

## 5. Call State

Implement a reusable `withCallState` custom feature for loading/error tracking:

```typescript
// shared/store/call-state.feature.ts
export type CallState = 'init' | 'loading' | 'loaded' | { error: string };

export function withCallState() {
  return signalStoreFeature(
    withState<{ callState: CallState }>({ callState: 'init' }),
    withComputed(({ callState }) => ({
      loading: computed(() => callState() === 'loading'),
      loaded: computed(() => callState() === 'loaded'),
      error: computed(() => {
        const s = callState();
        return typeof s === 'object' ? s.error : null;
      }),
    })),
  );
}

export const setLoading = () => ({ callState: 'loading' as CallState });
export const setLoaded = () => ({ callState: 'loaded' as CallState });
export const setError = (error: string) => ({ callState: { error } as CallState });
```

For **multiple async operations** in one store, parameterise:

```typescript
withCallState({ collection: 'books' });
// produces: booksLoading, booksLoaded, booksError
```

## 6. Custom Store Features

Extract cross-cutting concerns into `signalStoreFeature` — this keeps stores lean and eliminates duplication:

```typescript
export function withLogger() {
  return signalStoreFeature(
    withMethods((store) => ({
      _log(msg: string) {
        console.log('[Store]', msg, store);
      },
    })),
  );
}
```

Prefix internal-only helpers with `_` so they are recognisable but still accessible when needed.

## 7. Providing Stores

| Scope              | How                                         | When                                 |
| ------------------ | ------------------------------------------- | ------------------------------------ |
| Singleton / global | `{ providedIn: 'root' }` in `signalStore()` | Shared state across routes           |
| Component-scoped   | `providers: [MyStore]` in `@Component`      | State tied to a component's lifetime |
| Route-scoped       | `providers: [MyStore]` in the route config  | State tied to a route                |

Component/route-scoped stores automatically call `withHooks.onDestroy` on teardown — use this for cleanup.

## 8. Protected State

Enable `protectedState: true` to make state only mutable through `patchState` inside the store's own methods (Angular 18+):

```typescript
signalStore({ providedIn: 'root', protectedState: true }, ...)
```

This is the recommended default for any store that has methods managing state.

## 9. withProps (NgRx 19+)

Use `withProps` to share injected services or observables across multiple feature blocks without re-injecting:

```typescript
withProps((store) => ({
  _service: inject(BookService),
})),
withMethods((store) => ({
  load() { store._service.getAll()... }
}))
```

## 10. Naming Conventions

| Thing                 | Convention                              |
| --------------------- | --------------------------------------- |
| Store file            | `books.store.ts`                        |
| Store class           | `BooksStore`                            |
| Entity collection     | camelCase singular: `book`, not `books` |
| Private methods/props | Prefix with `_`                         |
| Call state helpers    | `setLoading`, `setLoaded`, `setError`   |

## 11. Template Integration

- Access state via signals: `store.books()`, `store.loading()`, `store.error()`
- Never call store methods inside templates — use `(click)="store.load()"` on events
- Expose derived values via `withComputed` rather than computing in templates

## 12. Common Pitfalls

- **Wrong order:** `withMethods` before `withComputed` — TypeScript will error
- **mutate():** Removed. Use `patchState` always
- **Raw catchError in rxMethod:** Completes the stream — use `tapResponse` instead
- **Forgetting setLoading:** Async methods should always set loading state before the async call
- **Injecting in withState:** `withState` runs before injection context; use `withState(() => ({...}))` factory form or `withProps` for injection
