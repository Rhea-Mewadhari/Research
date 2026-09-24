# Milestone

Task: task13
Target: backend

## Requirements addressed

- Req 1 — GET /api/auth/me resolves user from req.user.userId; spoofed query params ignored: verified — userProfile.test.ts 'returns only the caller's own data regardless of a spoofed id in the URL' PASSED (44 tests, 0 failed)
- Req 2 — PATCH /api/users/me returns 401 without valid JWT: verified — userProfile.test.ts 'requires a valid JWT' PASSED
- Req 3 — PATCH /api/users/me { username } → 200 with { user: { id, email, username, createdAt } }, no password field: verified — userProfile.test.ts 'updates the username and returns the new user object' PASSED
- Req 4 — PATCH /api/users/me with empty body → 400: verified — userProfile.test.ts 'returns 400 for an empty body / no recognised fields' PASSED
- Req 5 — PATCH /api/users/me with newPassword but no currentPassword → 400: verified — userProfile.test.ts 'returns 400 when newPassword is given without currentPassword' PASSED
- Req 6 — PATCH /api/users/me with wrong currentPassword → 400 'Current password is incorrect': verified — userProfile.test.ts 'returns 400 "Current password is incorrect" when currentPassword is wrong' PASSED; AppError statusCode 400 observed in stderr
- Req 7 — Correct currentPassword + newPassword → 200; old login → 401, new login → 200: verified — userProfile.test.ts 'updates the password so a subsequent login with the new password succeeds and the old one fails' PASSED
- Req 8 — After password update, DB stores bcrypt hash matching /^\$2[aby]?\$/: verified — userProfile.test.ts 'stores the updated password as a bcrypt hash, not plaintext' PASSED
- Req 9 — Taken email → 409; atomicity: follow-up GET shows original username+email: verified — userProfile.test.ts 'returns 409 for an email already taken by another user, and leaves no field changed' PASSED; AppError 'Email already registered' statusCode 409 in stderr
- Req 10 — Taken username → 409: verified — userProfile.test.ts 'returns 409 for a username already taken by another user' PASSED; AppError 'Username already taken' statusCode 409 in stderr
- Req 11 — userSchema.ts exports Zod schema; currentPassword-only body → 400; newPassword without currentPassword → 400: verified — file exists; requirements 4 and 5 pass confirming Zod rejections produce correct 400s
- Req 12 — userService.ts exports updateUser with single atomic UPDATE; no partial write on validation failure: verified — file exists; atomicity assertion in req 9 passes
- Req 13 — userRoutes.ts mounts PATCH /me behind requireJwt; app.ts mounts at /api/users: verified — userRoutes.ts line 9 registers route; app.ts line 28 mounts at /api/users; requirements 2–10 all pass
- Req 14 — pnpm test exits 0; userProfile.test.ts, auth.test.ts, products.test.ts all green: verified — vitest: Test Files 3 passed (3), Tests 44 passed (44); tsc -p tsconfig.build.json passed with no errors

## Files changed

- src/benchmark-backend/src/schemas/userSchema.ts: new file — Zod schema for PATCH /api/users/me body; optional username/email/currentPassword/newPassword; superRefine enforces at least one of {username,email,newPassword} and that newPassword requires currentPassword
- src/benchmark-backend/src/services/userService.ts: new file — updateUser() fetches user, verifies currentPassword with bcrypt.compareSync, checks email/username uniqueness against other users, runs single atomic UPDATE, returns UserResult without password
- src/benchmark-backend/src/controllers/authController.ts: added patchMe controller that reads req.user.userId and req.validated, delegates to updateUser, responds 200 with { user }; me() already read only req.user.userId (no change required)
- src/benchmark-backend/src/routes/userRoutes.ts: new file — Express router with router.patch('/me', requireJwt, validate(updateUserSchema), patchMe)
- src/benchmark-backend/src/app.ts: added import of userRoutes and app.use('/api/users', userRoutes) mount before 404 fallback

## Checks

- pnpm test: 44 passed, 0 failed (3 test files: products.test.ts 19, auth.test.ts 12, userProfile.test.ts 13)
- pnpm run build: pass (tsc -p tsconfig.build.json exited 0 with no TypeScript errors)
