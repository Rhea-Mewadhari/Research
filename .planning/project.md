# Project

Task: task13
Target: backend

## Idea

Task 13 extends the authentication foundation built in Task 12 to support user profile management. On the backend this means: (1) a `requireJwt` middleware that verifies the custom JWT and attaches `req.user.userId` to the request; (2) fixing `GET /api/auth/me` to resolve the authenticated user strictly from `req.user.userId` (not from URL query params) by routing it through `requireJwt`; (3) a new `PATCH /api/users/me` endpoint (behind `requireJwt`) that lets users update username, email, and/or password — all changes must be written atomically (no partial writes on uniqueness conflict), passwords hashed with bcrypt, and `currentPassword` required when `newPassword` is supplied; (4) a Zod schema, service, controller, and route wired into `app.ts` at `/api/users`.

## Spec pointers

- `src/benchmark-backend/instructions/task13.md`: Full task spec — Part 1 covers endpoint contract, validation rules, atomicity constraint, technical constraints, and the list of files to create/modify.
- `src/benchmark-backend/src/tests/visible/userProfile.test.ts`: Read-only test suite — 9 test cases covering: GET /api/auth/me ownership (spoofed URL id ignored), PATCH 401 without auth, username update returns new user, 400 empty body, 400 missing currentPassword, 400 wrong currentPassword, password change + subsequent login check, bcrypt hash verification, 409 email conflict with atomicity check, 409 username conflict.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/middleware/auth.ts`: Add `requireJwt` middleware — verifies JWT via `verifyJwt`, attaches `req.user = { userId }`, returns 401 on failure. (Do not modify `requireAuth`.)
- `src/benchmark-backend/src/types/express.d.ts`: Add `user?: { userId: string }` to the Express Request interface so `req.user` is typed.
- `src/benchmark-backend/src/controllers/authController.ts`: Fix `me` handler to use `req.user!.userId` (populated by `requireJwt`) instead of manually re-parsing the token.
- `src/benchmark-backend/src/routes/authRoutes.ts`: Add `requireJwt` to `GET /me` so the controller can rely on `req.user`.
- `src/benchmark-backend/src/schemas/userSchema.ts`: New file — Zod schema for PATCH body (all fields optional, at least one required, `newPassword` requires `currentPassword`).
- `src/benchmark-backend/src/services/userService.ts`: New file — `updateUser(userId, updates)` validates uniqueness of changed email/username against other users, verifies `currentPassword` via bcrypt, hashes `newPassword`, then writes all fields in a single atomic SQL UPDATE.
- `src/benchmark-backend/src/controllers/userController.ts`: New file — `updateMe` controller: extracts validated body, calls `userService.updateUser`, returns `{ user }`.
- `src/benchmark-backend/src/routes/userRoutes.ts`: New file — `PATCH /me` route behind `requireJwt` + `validate(userUpdateSchema)`.
- `src/benchmark-backend/src/app.ts`: Mount `userRoutes` at `/api/users`.
