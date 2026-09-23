# Project

Task: task13
Target: backend

## Idea

Extend the Task 12 authentication foundation to add a user profile management endpoint on the backend. The work requires creating `PATCH /api/users/me` (protected by the existing `requireJwt` middleware) that allows the authenticated user to update their username, email, and/or password atomically. Validation rules: empty/unrecognised bodies → 400; `newPassword` provided without a correct `currentPassword` → 400 with `"Current password is incorrect"`; email or username already taken by another user → 409 with no partial writes to any field. Password updates must be stored as bcrypt hashes. Also confirm (and fix if needed) that `GET /api/auth/me` resolves the user strictly from `req.user.userId` (already correct in the current code), ignoring any caller-supplied id in the URL. Finally, mount the new user router in `app.ts` at `/api/users`.

## Spec pointers

- `src/benchmark-backend/instructions/task13.md`: Full task spec covering both backend and frontend; Part 1 is authoritative for this run — covers the `PATCH /api/users/me` contract, `GET /api/auth/me` ownership requirement, technical constraints, and the list of files to create/modify.
- `src/benchmark-backend/src/tests/visible/userProfile.test.ts`: Visible test suite driving grading — covers: JWT auth guard (401), username update (200), empty body (400), missing currentPassword (400), wrong currentPassword (400 + specific error message), password change + re-login verification, bcrypt hash storage, taken email 409 with atomicity check, taken username 409.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/schemas/userSchema.ts`: New file — Zod schema for the PATCH body (username, email, currentPassword, newPassword all optional but enforcing at least one recognised field present).
- `src/benchmark-backend/src/services/userService.ts`: New file — `updateUser` service function performing uniqueness checks, password verification, bcrypt hashing, and a single atomic DB UPDATE.
- `src/benchmark-backend/src/controllers/authController.ts`: Existing file — `getMe` already reads from `req.user.userId` (line 38), so the ownership behaviour is correct; may need a thin `updateProfile` controller function added for the PATCH route.
- `src/benchmark-backend/src/routes/userRoutes.ts`: New file — Express router exposing `PATCH /me` behind `requireJwt`, delegating to the controller.
- `src/benchmark-backend/src/app.ts`: Existing file — import and mount `userRoutes` at `/api/users`.
- `src/benchmark-backend/src/errors/index.ts`: Existing — `ValidationError` (400), `ConflictError` (409), `AuthError` (401) are reusable; no new error classes needed.
- `src/benchmark-backend/src/middleware/requireJwt.ts`: Existing — used as-is; must not be modified.
