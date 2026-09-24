# Project

Task: task13
Target: backend

## Idea

Extend the existing Task 12 auth foundation by adding a `PATCH /api/users/me` endpoint that lets an authenticated user update their own username, email, and/or password. The endpoint requires JWT authentication via the existing `requireJwt` middleware, validates the request body with a new Zod schema, performs all validation checks (password verification, uniqueness of email/username) before writing, and updates atomically so no partial changes are persisted on failure. Additionally, `GET /api/auth/me` must be verified to resolve the user exclusively from the JWT payload (`req.user.userId`) — never from URL parameters — to prevent spoofed-id attacks.

## Spec pointers

- `src/benchmark-backend/instructions/task13.md`: Full task spec covering both backend (Part 1) and frontend (Part 2). Backend-relevant sections: endpoint contract, validation rules, atomicity requirement, no-password-in-response rule, `GET /api/auth/me` ownership fix, and the list of files to create/modify.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/schemas/userSchema.ts`: New file — Zod schema for the PATCH /api/users/me request body (optional username, email, currentPassword, newPassword with at-least-one-field refinement).
- `src/benchmark-backend/src/services/userService.ts`: New file — `updateUser` service function implementing atomic update, bcrypt password hashing, uniqueness conflict handling.
- `src/benchmark-backend/src/controllers/authController.ts`: Existing file — `getMe` (`me`) handler calls `authService.getById(req.user!.userId)` which is correct; URL query params like `?id=...&userId=...` are never read, so ownership is already safe.
- `src/benchmark-backend/src/routes/userRoutes.ts`: New file — Express router with `PATCH /me` route wired to `requireJwt` and the new user controller.
- `src/benchmark-backend/src/app.ts`: Existing file — mount new `userRoutes` under `/api/users`.
- `src/benchmark-backend/src/tests/visible/userProfile.test.ts`: Visible test file (read-only) — covers ownership of `GET /api/auth/me`, all `PATCH /api/users/me` cases including 401, 200, 400 (empty body, missing currentPassword, wrong currentPassword), bcrypt storage, and 409 conflicts with no side effects.
- `src/benchmark-backend/src/errors/index.ts`: Existing errors — `AppError`, `AuthError`, `ValidationError` available for reuse in the new service.
- `src/benchmark-backend/src/middleware/requireJwt.ts`: Existing middleware — used as-is for the new route; must not be modified.
- `src/benchmark-backend/src/services/authService.ts`: Existing service — `getById` helper and `UserRow` / `toPublicUser` pattern to follow; also `db` client import pattern.
- `src/benchmark-backend/src/db/client.ts`: Existing DB client — better-sqlite3 `db` instance, used for raw SQL queries.
