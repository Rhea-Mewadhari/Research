# Milestone

Task: task13
Target: backend

## Requirements addressed

- requireJwt middleware (req 1): verified — auth.ts exports `requireJwt` that extracts Bearer token, calls `verifyJwt`, sets `req.user = { userId }` and calls `next()` on success; returns 401 on absent/invalid token without calling further handlers; `requireAuth` unmodified. Tests for reqs 4, 5, 9-12 all pass with Bearer tokens; 'requires a valid JWT' returns 401.
- Express type augmentation (req 2): verified — express.d.ts line 6 declares `user?: { userId: string }` on Express Request interface; `pnpm exec tsc --noEmit` exits 0.
- GET /api/auth/me ownership fix (req 3): verified — authRoutes.ts line 11 `router.get('/me', requireJwt, me)`; authController.ts line 29 reads `req.user!.userId` only; test 'returns only the caller's own data regardless of a spoofed id in the URL' passed (136ms).
- PATCH /api/users/me authentication (req 4): verified — userRoutes.ts chains `requireJwt` before controller; test 'requires a valid JWT' returns 401 (2ms).
- Username update returns new user (req 5): verified — controller returns `{ user }` via `toUserResponse` (id, email, username, createdAt, no password); test 'updates the username and returns the new user object' passed (55ms).
- Empty body returns 400 (req 6): verified — userSchema.ts first `.refine()` rejects body with none of the four fields; test 'returns 400 for an empty body / no recognised fields' passed (55ms).
- newPassword without currentPassword returns 400 (req 7): verified — userSchema.ts second `.refine()` enforces currentPassword when newPassword present; test 'returns 400 when newPassword is given without currentPassword' passed (55ms).
- Wrong currentPassword returns 400 (req 8): verified — userService.ts throws AppError 400 'Current password is incorrect' on bcrypt mismatch; test 'returns 400 "Current password is incorrect" when currentPassword is wrong' passed (107ms).
- Password change succeeds (req 9): verified — userService.ts hashes newPassword with bcrypt and writes atomically; test 'updates the password so a subsequent login with the new password succeeds and the old one fails' passed (263ms).
- bcrypt hashing (req 10): verified — userService.ts uses `hash(updates.newPassword, 10)` producing `$2b$` prefix; test 'stores the updated password as a bcrypt hash, not plaintext' passed (157ms).
- Email conflict is atomic (req 11): verified — userService.ts checks all conflicts before single `UPDATE`; test 'returns 409 for an email already taken by another user, and leaves no field changed' passed (109ms); username unchanged after 409.
- Username conflict (req 12): verified — userService.ts throws AppError 409 USERNAME_CONFLICT; test 'returns 409 for a username already taken by another user' passed (111ms).
- Password never in responses (req 13): verified — `toUserResponse` in userService returns only {id, email, username, createdAt}; `res.body.user.password === undefined` assertion passed; all 44 tests pass.
- Zod schema (req 14): verified — userSchema.ts exports `userUpdateSchema` with four optional fields and two `.refine()` calls; `pnpm exec tsc --noEmit` exits 0.
- Atomic SQL update (req 15): verified — userService.ts builds setClauses array and issues a single `db.prepare('UPDATE users SET ... WHERE id = ?').run(...)` only after all checks pass; req 11 test confirms no partial write.
- File structure (req 16): verified — all 7 files confirmed present; app.ts line 28 mounts `userRoutes` at `/api/users`; `pnpm exec tsc --noEmit` exits 0.
- All visible tests pass (req 17): verified — `pnpm vitest run` output: Test Files 3 passed (3), Tests 44 passed (44); userProfile.test.ts 10/10 passed; exit code 0.

## Files changed

- `src/benchmark-backend/src/types/express.d.ts`: Added `user?: { userId: string }` to Express Request interface for typed `req.user.userId` access.
- `src/benchmark-backend/src/middleware/auth.ts`: Added exported `requireJwt` middleware — verifies Bearer JWT via `verifyJwt`, attaches `req.user = { userId }`, returns 401 on failure; `requireAuth` left unmodified.
- `src/benchmark-backend/src/routes/authRoutes.ts`: Added `requireJwt` to `GET /me` route before the `me` controller.
- `src/benchmark-backend/src/controllers/authController.ts`: Rewrote `me` handler to read user from `req.user!.userId` (set by `requireJwt`) instead of manually extracting the Bearer token.
- `src/benchmark-backend/src/schemas/userSchema.ts`: New file — Zod schema `userUpdateSchema` with optional username/email/currentPassword/newPassword fields and two `.refine()` calls enforcing at least one field and currentPassword when newPassword present.
- `src/benchmark-backend/src/services/userService.ts`: New file — exports `updateUser(userId, updates)`: verifies currentPassword via bcrypt, checks email/username uniqueness against other users, hashes newPassword, performs single atomic SQL UPDATE; returns user without password field.
- `src/benchmark-backend/src/controllers/userController.ts`: New file — exports `updateMe` controller that calls `userService.updateUser` and returns `{ user }` with status 200.
- `src/benchmark-backend/src/routes/userRoutes.ts`: New file — Express Router with `PATCH /me` behind `requireJwt` + `validate(userUpdateSchema)` + `updateMe`.
- `src/benchmark-backend/src/app.ts`: Mounted `userRoutes` at `/api/users`.

## Checks

- pnpm test: 44 passed, 0 failed (3 test files: auth.test.ts, products.test.ts, userProfile.test.ts — 10/10 userProfile tests)
- pnpm run build: pass (tsc --noEmit exits 0, no TypeScript errors)
