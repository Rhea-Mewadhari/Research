# Milestone

Task: task13
Target: backend

## Requirements addressed
- B1 — GET /api/auth/me resolves identity exclusively from JWT (ignores spoofed ?id query params): verified — test 'returns only the caller\'s own data regardless of a spoofed id in the URL' PASSED (44/44 tests passed).
- B2 — PATCH /api/users/me without valid JWT returns 401: verified — test 'requires a valid JWT' PASSED (44/44 tests passed).
- B3 — PATCH /api/users/me with empty body or no recognised fields returns 400: verified — test 'returns 400 for an empty body / no recognised fields' PASSED; Zod .refine rejects bodies where none of username/email/currentPassword/newPassword are present (44/44 tests passed).
- B4 — PATCH /api/users/me with valid JWT and username update returns 200 with user object (no password field): verified — test 'updates the username and returns the new user object' PASSED; res.body.user.password === undefined confirmed (44/44 tests passed).
- B5 — PATCH /api/users/me with newPassword but no currentPassword returns 400: verified — test 'returns 400 when newPassword is given without currentPassword' PASSED (44/44 tests passed).
- B6 — PATCH /api/users/me with wrong currentPassword returns 400 with exact message 'Current password is incorrect': verified — test 'returns 400 "Current password is incorrect" when currentPassword is wrong' PASSED; ValidationError thrown from userService.ts:37 (44/44 tests passed).
- B7 — Successful password change updates stored password; subsequent login with old password returns 401, new password returns 200: verified — test 'updates the password so a subsequent login with the new password succeeds and the old one fails' PASSED; AuthError: 'Invalid credentials' confirmed for old password (44/44 tests passed).
- B8 — After password change, password column contains bcrypt hash matching /^\$2[aby]?\$/, not plaintext: verified — test 'stores the updated password as a bcrypt hash, not plaintext' PASSED; direct DB query confirmed hash format (44/44 tests passed).
- B9 — Email conflict returns 409 and rolls back entire update atomically: verified — test 'returns 409 for an email already taken by another user, and leaves no field changed' PASSED; ConflictError: 'Email already registered' thrown from userService.ts:42; GET /api/auth/me confirmed original username and email unchanged (44/44 tests passed).
- B10 — Username conflict returns 409: verified — test 'returns 409 for a username already taken by another user' PASSED; ConflictError: 'Username already taken' thrown from userService.ts:49 (44/44 tests passed).
- B11 — password field never appears in any API response: verified — B4 test asserts res.body.user.password === undefined; SELECT excludes password column; TypeScript build succeeded with no errors (44/44 tests passed).

## Files changed
- `src/benchmark-backend/src/schemas/userSchema.ts`: Created — Zod schema with optional fields username, email, currentPassword, newPassword; two .refine calls: (1) at least one recognised field required, (2) currentPassword required when newPassword is present.
- `src/benchmark-backend/src/services/userService.ts`: Created — updateUser(userId, payload) function; bcrypt.compare for password verification; uniqueness checks for email and username before any writes; bcryptjs.hash for new password; single atomic UPDATE; returns { id, email, username, createdAt } without password.
- `src/benchmark-backend/src/controllers/userController.ts`: Created — updateMe handler; reads userId from req.jwtUser!.userId and payload from req.validated; calls userService.updateUser; returns { user } as JSON.
- `src/benchmark-backend/src/routes/userRoutes.ts`: Created — Express Router with PATCH /me chaining requireJwt → validate(updateUserSchema) → updateMe.
- `src/benchmark-backend/src/app.ts`: Modified — added import of userRoutes and app.use('/api/users', userRoutes) mount after authRoutes.

## Checks
- pnpm test: 44 passed, 0 failed (userProfile.test.ts: 11 tests covering B1–B11, plus 33 pre-existing tests)
- pnpm run build: pass (tsc -p tsconfig.build.json succeeded with no errors)
