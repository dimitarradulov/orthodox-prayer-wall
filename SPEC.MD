# Orthodox Prayer Request Web App

## Technical Specification

---

## 1. Overview

### Purpose

The application allows users to:

- Submit prayer requests
- Pray for other people's requests
- Notify request owners that someone prayed for them

The app emphasizes simplicity, humility, and Orthodox aesthetics.

### Core Principles

UI should be:

- Simple
- Calm
- Reverent
- Mobile-friendly
- Inspired by Orthodox church visual style

### Tech Stack

**Frontend:**

- Angular
- Tailwind CSS

**Backend:**

- Supabase
- PostgreSQL database
- Supabase Auth (Google)
- Row Level Security

---

## 2. Architecture Overview

```
Angular UI
↓
Signal Stores
↓
Supabase Services
↓
Supabase API
↓
PostgreSQL Database
```

---

## 3. Angular Project Structure

```
src/app

core/
  auth/
  services/
  guards/

features/
  prayer-requests/
    pages/
    components/
    store/
    services/

  admin/

shared/
  models/
  components/
  ui/
```

Example feature folder:

```
prayer-requests/

  prayer-feed.page.ts
  prayer-details.page.ts
  prayer-card.component.ts
  prayer-form.component.ts
```

---

## 4. Angular Modern Features

### Standalone Components

```ts
@Component({
  selector: 'app-prayer-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prayer-card.html'
})
```

### Dependency Injection

```ts
const supabase = inject(SupabaseService);
```

### Angular Control Flow

```html
@if(request()){
  <app-prayer-card />
}
```

Loop:

```html
@for(request of requests(); track request.id){
  <app-prayer-card [request]="request"/>
}
```

---

## 5. Signal-Based State Management

Each feature has a store service.

Example: `prayer-requests.store.ts`

Responsibilities:

- feed state
- pagination
- mutations
- loading state

### Example Store

```ts
@Injectable({ providedIn: 'root' })
export class PrayerRequestsStore {

  private prayerService = inject(PrayerRequestsService);

  private _requests = signal<PrayerRequest[]>([]);
  private _loading = signal(false);

  requests = this._requests.asReadonly();
  loading = this._loading.asReadonly();

  async loadInitial() {
    this._loading.set(true);

    const data = await this.prayerService.getFeed();

    this._requests.set(data);

    this._loading.set(false);
  }
}
```

---

## 6. Ideal Database Schema (Supabase)

Since Supabase uses PostgreSQL, we use relational tables instead of collections.

---

## 7. Tables

Main tables:

- `users`
- `prayer_requests`
- `prayers`

### 7.1 Users Table

Supabase Auth already creates: `auth.users`

We create a public profile table: `profiles`

**Schema:**

```
profiles

id          uuid (PK, references auth.users.id)
display_name text
avatar_url  text
role        text default 'user'
created_at  timestamp
```

Example:

```
id: uuid
display_name: "John"
role: "user"
```

Admin: `role = 'admin'`

### 7.2 Prayer Requests Table

**Schema:**

```
prayer_requests

id           uuid primary key
title        text
description  text
author_id    uuid references profiles(id)
author_name  text
prayer_count integer default 0
status       text default 'active'
created_at   timestamp default now()
```

Status options:

- `active`
- `answered`
- `archived`

### 7.3 Prayers Table

This table records who prayed for which request.

**Schema:**

```
prayers

id         uuid primary key
request_id uuid references prayer_requests(id)
user_id    uuid references profiles(id)
created_at timestamp default now()
```

Important constraint:

```sql
unique (request_id, user_id)
```

This guarantees:

- One user = one prayer per request
- No duplicates possible.

---

## 8. Query Design

Feed query:

```sql
select *
from prayer_requests
where status = 'active'
order by created_at desc
limit 10
```

Pagination:

```sql
where created_at < last_seen
order by created_at desc
limit 10
```

---

## 9. Supabase Service (Angular)

Create wrapper: `supabase.service.ts`

```ts
@Injectable({ providedIn: 'root' })
export class SupabaseService {

  client = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

}
```

---

## 10. Prayer Requests Service

`prayer-requests.service.ts`

Example query:

```ts
async getFeed() {

  const { data } = await this.supabase.client
    .from('prayer_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return data;

}
```

---

## 11. Prayer Logic

When user clicks "I prayed":

**Step 1** — Insert into `prayers`:

```ts
await supabase
  .from('prayers')
  .insert({
    request_id: id,
    user_id: user.id
  })
```

**Step 2** — Increment prayer count:

```ts
await supabase.rpc('increment_prayer_count', {
  request_id: id
});
```

Using SQL function.

---

## 12. SQL Function

Create safe counter increment:

```sql
create function increment_prayer_count(request_id uuid)
returns void
language sql
as $$
  update prayer_requests
  set prayer_count = prayer_count + 1
  where id = request_id;
$$;
```

---

## 13. Row Level Security

Enable RLS.

**Prayer Requests**

| Operation | Policy           |
|-----------|------------------|
| Read      | public read      |
| Insert    | authenticated users |
| Update    | author only      |
| Delete    | author OR admin  |

Example: `auth.uid() = author_id`

**Prayers Table**

Policy — Insert only if: `auth.uid() = user_id`

---

## 14. Authentication

Use Supabase Auth with Google provider.

```ts
await supabase.auth.signInWithOAuth({
  provider: 'google'
});
```

Auth state becomes signal:

```ts
user = signal<User | null>(null);
```

---

## 15. Infinite Scroll

Use `IntersectionObserver`.

When sentinel visible: `loadNextPage()`

---

## 16. Owner Prayer Count Visibility

```html
@if(user()?.id === request.author_id){
  <div>{{request.prayer_count}} prayed</div>
}
```

---

## 17. Admin Functionality

Admins determined by: `profiles.role = 'admin'`

Admin can delete any request.

---

## 18. UI Theme (Light Byzantine)

| Token      | Value     |
|------------|-----------|
| Background | `#f5f1e6` |
| Primary    | `#8b0000` |
| Accent     | `#c9a227` |

---

## 19. MVP Development Roadmap

1. Angular project
2. Supabase project
3. Google authentication
4. Profiles table
5. Prayer request creation
6. Feed
7. Prayer button
8. Unique prayer constraint
9. Infinite scroll
10. Owner view
11. Admin delete

---

## 20. Scalability

This schema scales well because:

- PostgreSQL indexes
- relational joins
- unique constraints
- counter column
- simple feed query

It can easily handle:

- 100k+ prayer requests
- millions of prayers
