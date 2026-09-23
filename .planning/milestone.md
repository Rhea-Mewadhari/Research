# Milestone

Task: task13
Target: backend

## Requirements addressed

- Req 1 — PATCH /api/users/me without a valid JWT returns 401: verified — userProfile.test.ts "requires a valid JWT" PASSED ✓ 2ms. Vitest: 44/44 tests passed.
- Req 2 — PATCH /api/users/me with valid JWT and recognised field returns 200 with { user: { id, email, username, createdAt } }, no password field: verified — "updates the username and returns the new user object" PASSED ✓ 4ms. Vitest: 44/44 tests passed.
- Req 3 — PATCH /api/users/me with empty body or only unrecognised fields returns 400: verified — "returns 400 for an empty body / no recognised fields" PASSED ✓ 4ms. Vitest: 44/44 tests passed.
- Req 4 — PATCH /api/users/me with newPassword but no currentPassword returns 400: verified — "returns 400 when newPassword is given without currentPassword" PASSED ✓ 4ms. Vitest: 44/44 tests passed.
- Req 5 — PATCH /api/users/me with wrong currentPassword returns 400 with { error: "Current password is incorrect" }: verified — "returns 400 'Current password is incorrect' when currentPassword is wrong" PASSED ✓ 4ms. Vitest: 44/44 tests passed.
- Req 6 — Correct currentPassword + newPassword stores bcrypt hash; re-login with new password succeeds; old password login returns 401: verified — two tests both PASSED ✓ (8ms and 5ms). Vitest: 44/44 tests passed.
- Req 7 — PATCH /api/users/me with taken email returns 409; no fields modified (atomicity): verified — "returns 409 for an email already taken by another user, and leaves no field changed" PASSED ✓ 7ms. GET /api/auth/me confirmed original username and email unchanged. Vitest: 44/44 tests passed.
- Req 8 — PATCH /api/users/me with taken username returns 409: verified — "returns 409 for a username already taken by another user" PASSED ✓ 4ms. Vitest: 44/44 tests passed.
- Req 9 — GET /api/auth/me resolves user from req.user.userId only, ignores ?id and ?userId query params: verified — "returns only the caller's own data regardless of a spoofed id in the URL" PASSED ✓ 21ms. Vitest: 44/44 tests passed.
- Req 10 — userRoutes mounted at /api/users in app.ts; PATCH /api/users/me not 404: verified — grep confirmed app.ts line 7 imports userRoutes and line 28 calls app.use('/api/users', userRoutes). All PATCH tests returned non-404. Build exit 0. Vitest: 44/44 tests passed.
- Req 11 — password field absent from all successful API responses: verified — "updates the username and returns the new user object" asserts res.body.user.password toBeUndefined PASSED ✓. Vitest: 44/44 tests passed.
- Req 12 — PATCH /api/users/me update is atomic; conflict on any field prevents all writes: verified — atomicity check in Req 7 test confirmed username rename not applied when email conflict raised 409. Vitest: 44/44 tests passed.

## Files changed

- `src/benchmark-backend/src/schemas/userSchema.ts`: New file — Zod schema with optional username/email/currentPassword/newPassword fields; superRefine rejects bodies with no recognised writable field and newPassword without currentPassword.
- `src/benchmark-backend/src/services/userService.ts`: New file — updateUser() verifies currentPassword via bcrypt.compare, checks email/username uniqueness scoped to other users, hashes newPassword with bcrypt.hash, executes a single atomic UPDATE, returns { id, email, username, createdAt }.
- `src/benchmark-backend/src/controllers/userController.ts`: New file — updateProfile handler parses req.body with userSchema.safeParse, throws ValidationError on failure, calls userService.updateUser, returns 200 with { user }.
- `src/benchmark-backend/src/routes/userRoutes.ts`: New file — Express router with PATCH /me behind requireJwt middleware delegating to updateProfile.
- `src/benchmark-backend/src/app.ts`: Modified — added import for userRoutes and app.use('/api/users', userRoutes) before the 404 catch-all.
- `src/benchmark-backend/src/controllers/authController.ts`: Verified unchanged — getMe already reads only req.user.userId; no query/param-based id lookup present.

## Checks

- pnpm test: 44 passed, 0 failed (userProfile.test.ts: all PATCH /api/users/me and GET /api/auth/me tests passed)
- pnpm run build: pass (tsc -p tsconfig.build.json, exit 0, no errors)
