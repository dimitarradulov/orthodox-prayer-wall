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
- AngularFire
- Tailwind CSS (recommended)

**Backend:**
- Firebase Authentication
- Firestore Database
- Firebase Security Rules

**Hosting:**
- Firebase Hosting

---

## 2. Core Features

### Unauthenticated Users

**Can:**
- View prayer requests
- Open full prayer request details

**Cannot:**
- Submit requests
- Pray
- Edit
- Delete

### Authenticated Users

Users logged in with Google Sign-In can:

- Submit prayer requests
- Pray for requests
- Edit their own requests
- Delete their own requests

### Admin Users

Admins can:

- Delete inappropriate prayer requests

---

## 3. Main User Flow

### Visiting the Website

User sees **Latest Prayer Requests**. Each request card contains:

- Title
- Short description preview
- Author
- Created date
- "Read more" link
- "I prayed 🙏" button

### Clicking "I Prayed"

If user:
- **Not logged in** → show login prompt
- **Logged in** → register prayer

After clicking:
- Button shows "You prayed 🙏"
- Button becomes disabled

### Request Owner

Owner can see: **🙏 12 people prayed**

Other users cannot see this number.

---

## 4. UI Layout

### Homepage

```
## Header
  Logo | Login Button

## Prayer Request Feed
  Request Card
  Request Card
  Request Card

  Load more (auto via scroll)
```

### Prayer Request Card

```
Title

Short text preview...

Author: John
Date: Mar 5

[ Read More ]  [ I Prayed 🙏 ]
```

### Prayer Request Details Page

```
Title

Full prayer request text

Author
Date

[ I Prayed 🙏 ]

If owner:
  🙏 12 people prayed
```

---

## 5. UI Design Style

### Light Byzantine Theme

| Element        | Value       | Description      |
| -------------- | ----------- | ---------------- |
| Background     | `#f5f1e6`   | Parchment tone   |
| Primary Color  | `#8b0000`   | Deep Orthodox red |
| Accent         | `#c9a227`   | Byzantine gold   |

### Font Suggestions

- **Titles:** Cormorant Garamond
- **Body:** Inter

---

## 6. Angular Project Structure

```
src/app
├── core/
│   ├── auth/
│   ├── services/
│   └── guards/
├── features/
│   └── prayer-requests/
│       ├── components/
│       ├── pages/
│       └── services/
├── shared/
│   ├── components/
│   └── models/
└── admin/
```

---

## 7. Data Model (Firestore)

**Collection:** `prayerRequests`

**Document:** `prayerRequests/{requestId}`

```ts
{
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: timestamp;
  prayerCount: number;
  status: 'active' | 'answered' | 'archived';
}
```

---

## 8. Prayer Tracking

**Collection:** `prayers`

**Document:** `prayers/{prayerId}`

```ts
{
  requestId: string;
  userId: string;
  createdAt: timestamp;
}
```

**Purpose:**
- Prevent duplicate prayers
- Track who prayed

---

## 9. "I Prayed" Logic

When user clicks button:

**Step 1** — Check if prayer exists:
```
where requestId == X
where userId == currentUser
```
If exists → do nothing.

**Step 2** — Create prayer record:
```ts
prayers/ {
  requestId,
  userId,
  createdAt,
}
```

**Step 3** — Increment counter:
```ts
prayerRequests/{id}
prayerCount += 1  // Use Firestore increment(1)
```

---

## 10. Infinite Scroll Feed

**Initial query:**
```ts
orderBy('createdAt', 'desc')
limit(10)
```

**On scroll:**
```ts
startAfter(lastVisible)
limit(10)
```

This ensures efficient pagination.

---

## 11. Security Rules

```js
match /prayerRequests/{id} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update: if request.auth.uid == resource.data.authorId;
  allow delete: if request.auth.uid == resource.data.authorId
             || request.auth.token.admin == true;
}

match /prayers/{id} {
  allow create: if request.auth != null;
  allow read: if request.auth != null;
}
```

---

## 12. Authentication

**Using:**
- Firebase Auth
- Google Provider

**Angular service:** `AuthService`

**Methods:**
- `loginWithGoogle()`
- `logout()`
- `currentUser$`

---

## 13. Angular Services

### `PrayerRequestService`

- `createRequest()`
- `updateRequest()`
- `deleteRequest()`
- `getRequests()`
- `getRequestById()`

### `PrayerService`

- `pray(requestId)`
- `hasUserPrayed(requestId)`
- `getPrayerCount(requestId)`

### `AuthService`

- `login()`
- `logout()`
- `user$`

---

## 14. Admin Functionality

Admins identified via **custom claims**.

Admin can:
- `deleteRequest()`

**Admin UI:** Admin sees a Delete button on each request.

---

## 15. Status System

Prayer request statuses:
- `active`
- `answered`
- `archived`

Users can mark their own request as **answered** 🙏

---

## 16. Angular Components

Recommended components:

- `HeaderComponent`
- `PrayerFeedComponent`
- `PrayerCardComponent`
- `PrayerDetailsComponent`
- `SubmitPrayerComponent`
- `EditPrayerComponent`
- `LoginButtonComponent`

---

## 17. Performance Considerations

Use Firestore indexes:

```
Index: createdAt desc
```

---

## 18. MVP Development Plan

Build in this order:

| Step | Task |
| ---- | ---- |
| 1    | Angular project setup |
| 2    | Firebase setup (Auth + Firestore) |
| 3    | Google authentication |
| 4    | Create prayer request |
| 5    | Prayer feed |
| 6    | Prayer details page |
| 7    | "I prayed" functionality |
| 8    | Prevent duplicate prayers |
| 9    | Owner prayer count visibility |
| 10   | Edit/Delete request |
| 11   | Admin delete |
