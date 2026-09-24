# Milestone

Task: task13
Target: backend

## Requirements addressed

- Requirement 1 (GET /api/auth/me resolves from JWT, not query params): verified — userProfile.test.tsx > "returns only the caller's own data regardless of a spoofed id in the URL" ✓ passed (107ms). Existing authController.me already uses req.user!.userId exclusively; no code change needed.
- Requirement 2 (PATCH /api/users/me without JWT returns 401): verified — userProfile.test.tsx > "requires a valid JWT" ✓ passed (2ms). requireJwt threw AuthError with statusCode 401.
- Requirement 3 (PATCH /api/users/me with valid JWT and { username } returns 200 with user object, no password field): verified — userProfile.test.tsx > "updates the username and returns the new user object" ✓ passed (49ms). res.body.user.username === 'after_username_change', res.body.user.email unchanged, res.body.user.password === undefined.
- Requirement 4 (PATCH /api/users/me with empty body returns 400): verified — userProfile.test.tsx > "returns 400 for an empty body / no recognised fields" ✓ passed (48ms). Zod at-least-one-field refinement rejected the empty body.
- Requirement 5 (PATCH /api/users/me with newPassword but no currentPassword returns 400): verified — userProfile.test.tsx > "returns 400 when newPassword is given without currentPassword" ✓ passed (48ms). Zod refinement enforced currentPassword must accompany newPassword.
- Requirement 6 (PATCH /api/users/me with wrong currentPassword returns 400 with correct error message): verified — userProfile.test.tsx > "returns 400 'Current password is incorrect' when currentPassword is wrong" ✓ passed (94ms). res.status === 400 and res.body.error === 'Current password is incorrect'.
- Requirement 7 (correct currentPassword + newPassword updates password; old login 401, new login 200): verified — userProfile.test.tsx > "updates the password so a subsequent login with the new password succeeds and the old one fails" ✓ passed (236ms). AuthError on old-password attempt; new login returned 200.
- Requirement 8 (updated password stored as bcrypt hash, not plaintext): verified — userProfile.test.tsx > "stores the updated password as a bcrypt hash, not plaintext" ✓ passed (142ms). Direct DB query confirmed stored value matches /^\$2[aby]?\$/ and differs from plaintext.
- Requirement 9 (conflict on taken email returns 409, no partial write): verified — userProfile.test.tsx > "returns 409 for an email already taken by another user, and leaves no field changed" ✓ passed (96ms). Follow-up GET /api/auth/me confirmed username and email both unchanged.
- Requirement 10 (conflict on taken username returns 409): verified — userProfile.test.tsx > "returns 409 for a username already taken by another user" ✓ passed (95ms). AppError: Username already in use with statusCode 409.
- Requirement 11 (Zod schema in src/schemas/userSchema.ts; pnpm tsc --noEmit exits 0): verified — requirements 4 and 5 pass in visible suite; pnpm tsc --noEmit exited 0 with no output.
- Requirement 12 (single atomic SQL UPDATE in updateUser; zero DB writes on validation failure): verified — requirement 9 atomicity assertion passed (96ms); pnpm tsc --noEmit exited 0.
- Requirement 13 (userRoutes.ts PATCH /me behind requireJwt; app.ts mounts at /api/users): verified — requirements 2 (401 without JWT) and 3 (200 with valid JWT) both pass.
- Requirement 14 (pnpm test exits 0, all tests pass, no skips): verified — pnpm test --reporter=verbose: Test Files 3 passed (3), Tests 44 passed (44). All 10 userProfile.test.ts cases ✓. Exit code 0.

## Files changed

- `src/benchmark-backend/src/schemas/userSchema.ts`: New file — Zod schema (updateUserSchema) with optional username/email/currentPassword/newPassword fields and two superRefine refinements: at-least-one-field, and newPassword requires currentPassword. Exports UpdateUserInput type.
- `src/benchmark-backend/src/services/userService.ts`: New file — updateUser async function implementing atomic update: bcrypt password verification, email/username uniqueness checks (excluding current user's own row), single SQL UPDATE, returns PublicUser with no password field.
- `src/benchmark-backend/src/controllers/userController.ts`: New file — updateMe handler reads req.user!.userId and req.validated (UpdateUserInput), calls userService.updateUser, responds { user } on success, forwards errors via next(err).
- `src/benchmark-backend/src/routes/userRoutes.ts`: New file — Express router with router.patch('/me', requireJwt, validate(updateUserSchema), updateMe).
- `src/benchmark-backend/src/app.ts`: Modified — added import of userRoutes and app.use('/api/users', userRoutes) so PATCH /api/users/me resolves correctly.

## Checks

- pnpm test: 44 passed, 0 failed (3 test files; userProfile.test.ts 10/10 ✓)
- pnpm run build: pass (pnpm tsc --noEmit exited 0, no TypeScript compilation errors)
