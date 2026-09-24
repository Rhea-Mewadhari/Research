# Requirements

<!-- Target: frontend (task13) -->

## ProtectedRoute (`src/benchmark-frontend/src/components/ProtectedRoute.tsx`)

1. `ProtectedRoute` accepts a `children` prop (React children API) and renders those children when authenticated — it no longer uses `Outlet`.
   - Verified by: `tests/protectedRoute.test.tsx` — the test renders `<ProtectedRoute><div data-testid="protected-content" /></ProtectedRoute>` as a route `element`; if `Outlet` is used instead of `children`, the protected content never renders and the second test fails.

2. When no `auth_token` is present in `localStorage`, `ProtectedRoute` renders `<Navigate to="/login" replace />` and the wrapped children are not mounted.
   - Verified by: `tests/protectedRoute.test.tsx` — "redirects to /login when the user is not authenticated" — `findByTestId('login-page')` must resolve and `queryByTestId('protected-content')` must be `null`.

3. When `auth_token` and `auth_user` are present in `localStorage`, `ProtectedRoute` renders its `children` without redirecting.
   - Verified by: `tests/protectedRoute.test.tsx` — "renders the wrapped content when the user is authenticated" — `getByTestId('protected-content')` must be in the document.

## AuthContext (`src/benchmark-frontend/src/context/AuthContext.tsx`)

4. The `User` interface exported from `AuthContext.tsx` includes a `createdAt` field typed as `string`.
   - Verified by: TypeScript compilation (`pnpm --filter benchmark-frontend build` or `tsc --noEmit`) succeeds; `protectedRoute.test.tsx` and `profilePage.test.tsx` both seed `localStorage` with `{ createdAt: '2024-01-01T00:00:00.000Z' }` and the `AuthProvider` parses this into a `User` without type errors.

5. `AuthContextValue` exposes an `updateUser(user: User): void` action that (a) calls `setUser` with the new user object, and (b) writes `JSON.stringify(user)` to `localStorage` under the key `auth_user`.
   - Verified by: `tests/profilePage.test.tsx` — "on success, updates the displayed user and localStorage" — after a successful PATCH, `JSON.parse(localStorage.getItem('auth_user'))` must match `{ email: 'new-email@example.com' }`; this only works if `ProfilePage` calls `updateUser` and `updateUser` persists to `localStorage`.

## ProfilePage (`src/benchmark-frontend/src/pages/ProfilePage.tsx`)

6. `ProfilePage` is a default export from `src/benchmark-frontend/src/pages/ProfilePage.tsx`.
   - Verified by: `tests/profilePage.test.tsx` imports `ProfilePage` from `'../src/pages/ProfilePage'`; a missing file causes a compilation/import failure and all profile tests fail.

7. In view mode, `ProfilePage` renders the authenticated user's `username`, `email`, and `createdAt` date as visible text.
   - Verified by: `tests/profilePage.test.tsx` — "displays the current username, email, and member-since date" — `getByText(/seed_user/i)`, `getByText(/seed@example\.com/i)`, and `getByText(/2024/)` must all be in the document.

8. `ProfilePage` renders a button with accessible name matching `/edit profile/i` in view mode.
   - Verified by: `tests/profilePage.test.tsx` — `openEditForm` calls `getByRole('button', { name: /edit profile/i })`; if absent the button-click throws and every edit-mode test fails.

9. Clicking "Edit Profile" reveals the edit form; the form contains an input with label matching `/^username$/i` pre-filled with the current username, and an input with label matching `/^email$/i` pre-filled with the current email.
   - Verified by: `tests/profilePage.test.tsx` — "pre-fills the edit form with the current username and email" — `getByLabelText(/^username$/i)` must have value `'seed_user'` and `getByLabelText(/^email$/i)` must have value `'seed@example.com'`.

10. The edit form contains a button with accessible name matching `/^save$/i` and a button with accessible name matching `/cancel/i`.
    - Verified by: `tests/profilePage.test.tsx` — multiple test cases call `getByRole('button', { name: /^save$/i })` and `getByRole('button', { name: /cancel/i })`; missing either button causes test failure.

11. The edit form contains a button with accessible name matching `/change password/i`; clicking it reveals three password inputs with labels: `/current password/i`, `/^new password$/i`, and `/confirm new password/i`.
    - Verified by: `tests/profilePage.test.tsx` — "on a 400 incorrect current password" — clicks the "Change Password" button then uses `getByLabelText` for all three fields before clicking Save; missing any label causes the test to throw.

## ProfilePage — diff / save behaviour

12. Clicking "Save" when no field values differ from the original user sends no network request.
    - Verified by: `tests/profilePage.test.tsx` — "does not issue a request when nothing has changed" — after clicking Save with an unchanged form, `fetchMock` must not have been called (`expect(fetchMock).not.toHaveBeenCalled()`).

13. Clicking "Save" when exactly one field has changed sends a `PATCH` request whose JSON body contains only that changed field and no unchanged fields.
    - Verified by: `tests/profilePage.test.tsx` — "sends only the changed field in the PATCH body" — only `username` is edited; `JSON.parse(patchCall[1].body)` must deep-equal `{ username: 'renamed_user' }` (no `email` key present).

14. Clicking "Cancel" closes the edit form, restores the view to the pre-edit values, and sends no network request.
    - Verified by: `tests/profilePage.test.tsx` — "cancel discards changes and restores the pre-edit values, without sending a request" — `fetchMock` must not be called, `getByText(/seed_user/i)` must be present, and `queryByText(/a_discarded_name/i)` must be null after clicking Cancel.

## ProfilePage — success handling

15. On a 200 response, `ProfilePage` (a) updates the displayed user to the server-returned user object, (b) writes the server-returned user to `localStorage` under `auth_user`, and (c) dismisses the edit form so the email and username inputs are no longer in the DOM.
    - Verified by: `tests/profilePage.test.tsx` — "on success, updates the displayed user and localStorage, and dismisses the edit form" — `findByText(/new-email@example\.com/i)` must resolve, `queryByLabelText(/^email$/i)` must be null (form dismissed), and `JSON.parse(localStorage.getItem('auth_user'))` must match `{ email: 'new-email@example.com' }`.

## ProfilePage — error handling

16. On a 409 response, `ProfilePage` displays the server's `error` string as inline text and keeps the edit form open.
    - Verified by: `tests/profilePage.test.tsx` — "on a 409 conflict, shows the server error message inline" — `findByText(/email already registered/i)` must resolve after a PATCH returning `{ status: 409, json: { error: 'Email already registered' } }`.

17. On a 400 response, `ProfilePage` displays the server's `error` string as inline text and keeps the edit form open.
    - Verified by: `tests/profilePage.test.tsx` — "on a 400 incorrect current password, shows the error below the current password field" — `findByText(/current password is incorrect/i)` must resolve after a PATCH returning `{ status: 400, json: { error: 'Current password is incorrect' } }`.

## App.tsx routing

18. `src/benchmark-frontend/src/App.tsx` defines a `/profile` route that renders `ProfilePage` wrapped in `ProtectedRoute` using the children API: `<ProtectedRoute><ProfilePage /></ProtectedRoute>`.
    - Verified by: TypeScript compilation succeeds with `ProfilePage` imported and the route present; `tests/protectedRoute.test.tsx` tests pass (they exercise the same children API through an independent `MemoryRouter` render, confirming `ProtectedRoute` with children works end-to-end).

---

## Edge Cases

- **`createdAt` absent from seeded user:** covered by requirement 7 — the test always seeds a full `SEED_USER` with `createdAt`; the `User` interface must type the field correctly or TypeScript rejects it.
- **"Save" with password section visible but all password fields empty:** no password change is intended; no additional fields should be added to the PATCH body — covered by requirement 12 (no request when nothing changed).
- **Password section filled but profile fields unchanged:** only password-related fields (e.g. `currentPassword`, `newPassword`) are sent in the PATCH body — consistent with requirement 13's diff logic (only changed/filled fields).
- **Edit form stays open after 409 or 400 error:** covered by requirements 16 and 17 — the tests only assert the error text appears; the form remaining open is the natural consequence of not dismissing it on error.
- **Cancel after a successful save is impossible:** after success the edit form is dismissed (requirement 15); the user cannot cancel a non-existent form.
- **`auth_user` key name must be exact:** `localStorage.getItem('auth_user')` is asserted by name in requirement 15; any deviation (`authUser`, `user`, etc.) causes that assertion to fail.

---

<!-- Target: backend (task13) -->

# Backend Requirements

## GET /api/auth/me — ownership guard

B1. `GET /api/auth/me` resolves the caller's identity exclusively from the JWT-decoded
    `req.jwtUser.userId`. A request carrying `?id=<other-user-id>&userId=<other-user-id>`
    in the query string while authenticated as a different user must return HTTP 200 with
    the token owner's `id`, `email`, and `username` — not those of the spoofed id.
    - Verified by: `src/tests/visible/userProfile.test.ts` → describe
      `GET /api/auth/me — ownership` → "returns only the caller's own data regardless of a
      spoofed id in the URL"; asserts `res.status === 200`, `res.body.id === mine.id`,
      `res.body.email === mine.email`, `res.body.username === mine.username`.

## PATCH /api/users/me — authentication

B2. `PATCH /api/users/me` without a valid `Authorization: Bearer <token>` header returns
    HTTP 401.
    - Verified by: `userProfile.test.ts` → "requires a valid JWT";
      asserts `res.status === 401`.

## PATCH /api/users/me — body validation

B3. `PATCH /api/users/me` with a body that is empty (`{}`) or contains no recognised
    fields (`username`, `email`, `currentPassword`, `newPassword`) returns HTTP 400.
    - Verified by: `userProfile.test.ts` → "returns 400 for an empty body / no recognised
      fields"; asserts `res.status === 400`.

## PATCH /api/users/me — username update

B4. `PATCH /api/users/me` with a valid JWT and `{ username: "after_username_change" }`
    returns HTTP 200 with `{ user: { id, email, username, createdAt } }` where `username`
    is the new value, `email` is unchanged, and `user.password` is absent.
    - Verified by: `userProfile.test.ts` → "updates the username and returns the new user
      object"; asserts `res.status === 200`, `res.body.user.username === 'after_username_change'`,
      `res.body.user.email === user.email`, `res.body.user.password === undefined`.

## PATCH /api/users/me — password change rules

B5. `PATCH /api/users/me` with `newPassword` present but `currentPassword` absent returns
    HTTP 400.
    - Verified by: `userProfile.test.ts` → "returns 400 when newPassword is given without
      currentPassword"; asserts `res.status === 400`.

B6. `PATCH /api/users/me` with both `newPassword` and `currentPassword` present, where
    `currentPassword` does not match the stored bcrypt hash, returns HTTP 400 with JSON
    body `{ "error": "Current password is incorrect" }`.
    - Verified by: `userProfile.test.ts` → 'returns 400 "Current password is incorrect"
      when currentPassword is wrong'; asserts `res.status === 400` and
      `res.body.error === 'Current password is incorrect'`.

B7. `PATCH /api/users/me` with correct `currentPassword` and valid `newPassword` returns
    HTTP 200 and updates the stored password such that: a subsequent `POST /api/auth/login`
    with the old password returns HTTP 401, and with the new password returns HTTP 200.
    - Verified by: `userProfile.test.ts` → "updates the password so a subsequent login
      with the new password succeeds and the old one fails"; asserts `patchRes.status === 200`,
      `oldLogin.status === 401`, `newLogin.status === 200`.

## PATCH /api/users/me — bcrypt storage

B8. After a successful password change via `PATCH /api/users/me`, the `password` column
    in the `users` table contains a bcrypt hash matching `/^\$2[aby]?\$/` and not the
    plaintext new password string.
    - Verified by: `userProfile.test.ts` → "stores the updated password as a bcrypt hash,
      not plaintext"; directly queries `db.prepare('SELECT password FROM users WHERE
      email = ?').get(user.email)`, asserts `row.password !== 'the-new-password2'` and
      `row.password` matches `/^\$2[aby]?\$/`.

## PATCH /api/users/me — conflict detection and atomicity

B9. `PATCH /api/users/me` where the requested `email` is already owned by another user
    returns HTTP 409, and the entire update is rolled back — a subsequent `GET /api/auth/me`
    returns the original `username` and `email` unchanged (including any `username` that
    was supplied alongside the conflicting `email` in the same request).
    - Verified by: `userProfile.test.ts` → "returns 409 for an email already taken by
      another user, and leaves no field changed"; asserts `res.status === 409`, then
      fetches `GET /api/auth/me` and checks `me.body.username === 'wants_taken_email_user'`
      and `me.body.email === 'wants-taken-email@example.com'`.

B10. `PATCH /api/users/me` where the requested `username` is already owned by another
     user returns HTTP 409.
     - Verified by: `userProfile.test.ts` → "returns 409 for a username already taken by
       another user"; asserts `res.status === 409`.

## Password never in response

B11. The `password` field must never appear in any API response body — not in
     `PATCH /api/users/me` 200 responses and not in `GET /api/auth/me` responses.
     - Verified by: B4's `expect(res.body.user.password).toBeUndefined()` check in the
       username-update test; all `userService.updateUser` and `authService.getById` return
       values must omit the `password` column.

---

## Backend files to create or modify

- **Create** `src/benchmark-backend/src/schemas/userSchema.ts` — Zod schema with optional
  fields `username`, `email`, `currentPassword`, `newPassword`; `.refine` rejects bodies
  where none of these are present.
- **Create** `src/benchmark-backend/src/services/userService.ts` — `updateUser(userId,
  payload)`: verifies `currentPassword` via bcrypt when `newPassword` is supplied, checks
  uniqueness for changed email/username, hashes new password, executes a single atomic
  `UPDATE`, returns the user row without `password`.
- **Create** `src/benchmark-backend/src/routes/userRoutes.ts` — Express router: applies
  `requireJwt`, then Zod validation middleware, then `updateMe` controller on `PATCH /me`.
- **Create** `src/benchmark-backend/src/controllers/userController.ts` — `updateMe`
  handler: reads `req.jwtUser!.userId` and `req.validated`, calls `userService.updateUser`,
  returns `{ user }`.
- **Modify** `src/benchmark-backend/src/app.ts` — mount `userRoutes` at `/api/users`.
- **Verify (no change expected)** `src/benchmark-backend/src/controllers/authController.ts`
  — `me` already uses `req.jwtUser!.userId`; no URL params are consulted (B1 is already
  satisfied by the current implementation at line 37).

---

## Backend edge cases

- `currentPassword` absent when `newPassword` is present: covered by B5.
- `currentPassword` present and wrong when `newPassword` is present: covered by B6.
- Body with unrecognised keys only (no `username`/`email`/`currentPassword`/`newPassword`):
  covered by B3 — Zod `.refine` must reject this as "no recognised fields".
- Multi-field update where email conflicts: both the `username` change and the `email`
  change must be rolled back atomically; covered by B9.
- Password stored as plaintext after update: covered by B8.
- `password` field leaked in response: covered by B11.
- Spoofed `id`/`userId` query params on `GET /api/auth/me`: covered by B1.
