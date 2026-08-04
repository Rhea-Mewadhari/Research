# Task 13: Feature — User Profile Management (Full-Stack)

## Objective

Extend the authentication foundation built in Task 12 to support viewing and editing a user's own profile. The backend must expose protected profile endpoints. The frontend must provide a profile page where a logged-in user can view and update their details.

This is a single task that spans two repos, same as Task 12. Work through the backend section first, then the frontend section.

---

## Context

Task 12 established user registration, login, and the `GET /api/auth/me` endpoint. The users table exists and JWTs are issued and validated by `requireJwt` middleware.

This task builds on that foundation. Do not re-implement anything from Task 12 — treat the auth layer as complete and stable.

Watch for the specific mistakes called out below (missing ownership checks, unhashed passwords, non-atomic multi-field updates, unguarded routes, over-eager diffing) — they are the exact failure modes this task's tests check for.

---

## Part 1 — Backend (`src/benchmark-backend`)

### New Endpoint — PATCH /api/users/me

Allows the authenticated user to update their own profile.

Request body (all fields optional, at least one required):
```json
{
  "username": "new_username",
  "email": "new@example.com",
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

Response `200`:
```json
{
  "user": {
    "id": "uuid-v4",
    "email": "new@example.com",
    "username": "new_username",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

Rules:
- Requires `requireJwt` middleware
- If `newPassword` is provided, `currentPassword` must also be provided and must be correct — return `400 { "error": "Current password is incorrect" }` if not (this also covers the case where `currentPassword` is missing)
- If `email` is changed, validate it is not already taken by another user — return `409`
- If `username` is changed, validate it is not already taken by another user — return `409`
- If the request body is empty or contains no recognised fields, return `400`
- Never return the `password` field in the response
- The update must be atomic — if any validation fails, no fields are updated (a partial username-then-email update where the email step fails must not leave the username changed)

### Getting `GET /api/auth/me` right

`GET /api/auth/me` must resolve the user strictly from the decoded JWT (`req.user.userId`), never from anything caller-supplied in the URL (path params or query string). A request with a spoofed id anywhere in the URL must still return only the token owner's own data.

### Technical Constraints

- Do not modify `requireJwt` middleware itself, or any Task 12 auth logic
- All validation must use the existing Zod schema pattern in `src/schemas/`
- The `password` field must never appear in any API response
- Password updates must be hashed with bcrypt before being written to the database
- Multi-field updates must be written as a single atomic operation, not sequential per-field writes

### Backend files to create or modify

- `src/schemas/userSchema.ts` — Zod schema for the PATCH body
- `src/services/userService.ts` — `updateUser`, with atomic update and correct password hashing
- `src/controllers/authController.ts` — ensure `getMe` resolves the user from `req.user.userId`, not a URL parameter
- `src/routes/userRoutes.ts` — `PATCH /api/users/me` route
- `src/app.ts` — mount user routes

---

## Part 2 — Frontend (`src/benchmark-frontend`)

### New page — `/profile` (protected route)

- Redirect to `/login` if the user is not authenticated
- Display current user details: username, email, member since date
- Edit form (inline, toggled by an "Edit Profile" button):
  - Username field (pre-filled with current value)
  - Email field (pre-filled with current value)
  - Change password section (collapsed by default, expandable):
    - Current password field
    - New password field (min 8 characters)
    - Confirm new password field
  - Save and Cancel buttons
- On save: `PATCH /api/users/me` with **only the fields that changed** — diff the form state against the original user values first; if nothing changed, do not make the request
- On success: update `AuthContext` user state (not just `localStorage`) with the new user data, dismiss the edit form, show a success message
- On `409`: display the error inline below the relevant field
- On `400` (incorrect current password): display the error below the current password field
- Cancel discards changes and restores pre-edit values

### Getting the route guard right

Implement a reusable `ProtectedRoute` component that checks `AuthContext.isAuthenticated` and redirects to `/login` if false. Wrap `/profile` with it. It must be generic enough to wrap other routes later — don't hardcode anything profile-specific into it.

### Technical Constraints

- `ProtectedRoute` must be reusable — it will wrap additional routes in the future
- `AuthContext` needs a new action (e.g. `updateUser`) so the PATCH response can update in-memory user state, not just `localStorage`
- Do not modify or re-implement any Task 12 auth logic (`login`, `register`, `logout`, the signup/login pages, `NavBar`'s existing auth links)

### Frontend files to create or modify

- `src/components/ProtectedRoute.tsx` — auth guard component
- `src/pages/ProfilePage.tsx` — profile view and edit form
- `src/App.tsx` (or `src/router.tsx`, if routing has already been split out) — wrap `/profile` with `ProtectedRoute`
- `src/context/AuthContext.tsx` — add an `updateUser` action

---

## Success Criteria

- `GET /api/auth/me` returns only the authenticated user's own data regardless of any URL parameters
- `PATCH /api/users/me` with a valid username change updates correctly and returns the new user object
- `PATCH /api/users/me` with `newPassword` but a missing or incorrect `currentPassword` returns 400
- `PATCH /api/users/me` with a taken email returns 409 and makes no changes to any field
- Passwords are stored as bcrypt hashes after an update — a subsequent login with the new password succeeds
- Unauthenticated navigation to `/profile` redirects to `/login`
- The edit form only sends changed fields in the PATCH request body, and sends nothing if nothing changed
- A successful profile edit updates both `AuthContext` state and `localStorage`
- The password is never returned in any API response
- All visible tests pass in both repos (`pnpm test`)
