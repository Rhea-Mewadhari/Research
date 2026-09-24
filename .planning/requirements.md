# Requirements

<!-- Task 13 — Backend: PATCH /api/users/me, GET /api/auth/me ownership -->

1. `GET /api/auth/me` resolves the user exclusively from `req.user.userId` (the decoded JWT payload). A request bearing User A's JWT but including `?id=<User-B-id>&userId=<User-B-id>` in the query string must return User A's own `id`, `email`, and `username` — not User B's.
   - Verified by: `src/tests/visible/userProfile.test.ts` — "returns only the caller's own data regardless of a spoofed id in the URL" — asserts `res.status === 200`, `res.body.id === mine.id`, `res.body.email === mine.email`, `res.body.username === mine.username`.

2. `PATCH /api/users/me` without a valid JWT bearer token returns HTTP 401.
   - Verified by: `src/tests/visible/userProfile.test.ts` — "requires a valid JWT" — asserts `res.status === 401`.

3. `PATCH /api/users/me` with a valid JWT and `{ username: "<new>" }` returns HTTP 200 with body `{ user: { id, email, username, createdAt } }` where `username` equals the new value, `email` is unchanged, and the response body contains no `password` field at any nesting level.
   - Verified by: `src/tests/visible/userProfile.test.ts` — "updates the username and returns the new user object" — asserts `res.status === 200`, `res.body.user.username === 'after_username_change'`, `res.body.user.email === user.email`, `res.body.user.password === undefined`.

4. `PATCH /api/users/me` with a valid JWT and an empty body `{}` (no recognised fields) returns HTTP 400.
   - Verified by: `src/tests/visible/userProfile.test.ts` — "returns 400 for an empty body / no recognised fields" — asserts `res.status === 400`.

5. `PATCH /api/users/me` with a valid JWT and `{ newPassword: "..." }` but no `currentPassword` field returns HTTP 400.
   - Verified by: `src/tests/visible/userProfile.test.ts` — "returns 400 when newPassword is given without currentPassword" — asserts `res.status === 400`.

6. `PATCH /api/users/me` with a valid JWT, an incorrect `currentPassword`, and a `newPassword` returns HTTP 400 with body `{ "error": "Current password is incorrect" }`.
   - Verified by: `src/tests/visible/userProfile.test.ts` — "returns 400 'Current password is incorrect' when currentPassword is wrong" — asserts `res.status === 400` and `res.body.error === 'Current password is incorrect'`.

7. `PATCH /api/users/me` with a valid JWT, the correct `currentPassword`, and a `newPassword` updates the stored password. After updating: (a) `POST /api/auth/login` with the old password returns 401; (b) `POST /api/auth/login` with the new password returns 200.
   - Verified by: `src/tests/visible/userProfile.test.ts` — "updates the password so a subsequent login with the new password succeeds and the old one fails" — asserts old login returns 401, new login returns 200.

8. After a successful password update via `PATCH /api/users/me`, the `password` column in the `users` table contains a bcrypt hash (matching `/^\$2[aby]?\$/`) — not the plaintext new password.
   - Verified by: `src/tests/visible/userProfile.test.ts` — "stores the updated password as a bcrypt hash, not plaintext" — direct DB query asserts `row.password` does not equal the plaintext value and matches `/^\$2[aby]?\$/`.

9. `PATCH /api/users/me` with a valid JWT and `{ username: "<new>", email: "<already-taken-by-another-user>" }` returns HTTP 409. A subsequent `GET /api/auth/me` must show the user's `username` and `email` are both unchanged — no partial write occurred.
   - Verified by: `src/tests/visible/userProfile.test.ts` — "returns 409 for an email already taken by another user, and leaves no field changed" — asserts `res.status === 409`, then `GET /api/auth/me` returns `username === 'wants_taken_email_user'` and `email === 'wants-taken-email@example.com'`.

10. `PATCH /api/users/me` with a valid JWT and `{ username: "<already-taken-by-another-user>" }` returns HTTP 409.
    - Verified by: `src/tests/visible/userProfile.test.ts` — "returns 409 for a username already taken by another user" — asserts `res.status === 409`.

11. The PATCH request body is validated by a Zod schema in `src/schemas/userSchema.ts` that accepts optional fields `username`, `email`, `currentPassword`, `newPassword` and uses a Zod refinement to reject a body where none of these recognised fields are present (enforcing the at-least-one-field rule).
    - Verified by: requirements 4 and 5 exercised via the visible test suite; `pnpm tsc --noEmit` inside `src/benchmark-backend` exits 0 (no TypeScript compilation errors).

12. The `updateUser` function in `src/services/userService.ts` issues a single SQL `UPDATE` statement that sets all changed columns in one atomic operation — not sequential per-field `UPDATE` statements. If any validation check fails (wrong password, taken email/username), zero DB writes occur.
    - Verified by: requirement 9's atomicity assertion (email conflict leaves username also unchanged); `pnpm tsc --noEmit` exits 0.

13. `src/routes/userRoutes.ts` defines a router with `PATCH /me` behind the `requireJwt` middleware. `src/app.ts` mounts that router at `/api/users` so the full path resolves to `PATCH /api/users/me`.
    - Verified by: requirements 2 and 3 (401 without JWT, 200 with valid JWT) passing in the visible test suite.

14. `pnpm test` run from `src/benchmark-backend` exits with code 0 and all tests in `src/tests/visible/userProfile.test.ts` are reported as passed (no skips, no failures). Test files must not be modified.
    - Verified by: `cd src/benchmark-backend && pnpm test` completes with exit code 0.

---

## Edge cases

- **`currentPassword` missing when `newPassword` is supplied**: treated identically to a wrong password (HTTP 400) — covered by requirements 5 and 6. The Zod schema enforces that `currentPassword` must be present whenever `newPassword` is.
- **Username + email both submitted but email conflicts**: username must NOT be persisted even though it was processed first — covered by requirement 9 (all-or-nothing atomicity).
- **`password` field never in API responses**: covered by requirement 3 (`res.body.user.password === undefined`); applies to all 200 responses, not only the username-change case.
- **Uniqueness check must exclude the current user's own row**: a user submitting their own current email must not receive a 409 — the SQL uniqueness check must filter `WHERE id != <current-user-id>`. Not directly tested by the visible suite but required for correctness.
- **`requireJwt` middleware must not be modified**: covered by the framework constraint; only the new route file imports and applies it.
