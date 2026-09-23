# Requirements

## requireJwt middleware

1. `requireJwt` is added to `src/benchmark-backend/src/middleware/auth.ts`. It verifies the Bearer token using `verifyJwt`, attaches `req.user = { userId }` on success, and calls `next()`. When the token is absent or invalid it responds with HTTP 401 and calls no further handlers. It must not modify `requireAuth`.
   - Verified by: tests for requirements 4, 5, 9, 10, 11, 12 — all require a valid token via `Authorization: Bearer <token>` and succeed; test for requirement 4 sends no token and asserts 401.

## Express type augmentation

2. `src/benchmark-backend/src/types/express.d.ts` (new or existing) declares `user?: { userId: string }` on the Express `Request` interface, so `req.user.userId` compiles without `any` or `@ts-ignore`.
   - Verified by: `pnpm --filter benchmark-backend exec tsc --noEmit` exits with code 0 (no TypeScript errors across the project).

## GET /api/auth/me — ownership fix

3. `GET /api/auth/me` is routed through `requireJwt` (added to `src/benchmark-backend/src/routes/authRoutes.ts`) and its controller reads the user exclusively from `req.user!.userId`, never from query-string params (`?id=`, `?userId=`). A request carrying a spoofed id in the query string still returns only the token owner's data.
   - Verified by: test "returns only the caller's own data regardless of a spoofed id in the URL" — registers two users, sends `GET /api/auth/me?id=<other.id>&userId=<other.id>` with `mine`'s Bearer token, asserts `res.status === 200` and `res.body.id`, `res.body.email`, `res.body.username` all match `mine`'s values.

## PATCH /api/users/me — authentication

4. `PATCH /api/users/me` requires a valid JWT. Any request without a valid `Authorization: Bearer <token>` header returns HTTP 401.
   - Verified by: test "requires a valid JWT" — unauthenticated PATCH returns 401.

## PATCH /api/users/me — username update

5. `PATCH /api/users/me` with a valid JWT and body `{ username: "new_value" }` returns HTTP 200 with JSON body `{ user: { id, email, username, createdAt } }` where `user.username` equals the new value, `user.email` is unchanged, and the `user` object does not contain a `password` field.
   - Verified by: test "updates the username and returns the new user object" — checks `res.status === 200`, `res.body.user.username === 'after_username_change'`, `res.body.user.email === user.email`, and `res.body.user.password === undefined`.

## PATCH /api/users/me — empty body

6. `PATCH /api/users/me` with an empty body `{}` or a body that contains no recognised fields (`username`, `email`, `currentPassword`, `newPassword`) returns HTTP 400.
   - Verified by: test "returns 400 for an empty body / no recognised fields" — sends `{}` with a valid token, asserts `res.status === 400`.

## PATCH /api/users/me — newPassword without currentPassword

7. `PATCH /api/users/me` with `{ newPassword: "..." }` but no `currentPassword` field returns HTTP 400.
   - Verified by: test "returns 400 when newPassword is given without currentPassword" — sends `{ newPassword: 'brandnewpassword1' }`, asserts `res.status === 400`.

## PATCH /api/users/me — wrong currentPassword

8. `PATCH /api/users/me` with `{ currentPassword, newPassword }` where `currentPassword` does not match the stored bcrypt hash returns HTTP 400 with JSON body `{ "error": "Current password is incorrect" }`.
   - Verified by: test "returns 400 'Current password is incorrect' when currentPassword is wrong" — checks `res.status === 400` and `res.body.error === 'Current password is incorrect'`.

## PATCH /api/users/me — password change succeeds

9. `PATCH /api/users/me` with a correct `currentPassword` and a `newPassword` updates the stored password such that: (a) a subsequent `POST /api/auth/login` with the old password returns HTTP 401, and (b) a subsequent `POST /api/auth/login` with the new password returns HTTP 200.
   - Verified by: test "updates the password so a subsequent login with the new password succeeds and the old one fails" — asserts `patchRes.status === 200`, `oldLogin.status === 401`, `newLogin.status === 200`.

## PATCH /api/users/me — bcrypt hashing

10. After a successful password update, the `password` column in the `users` table stores a bcrypt hash, not the plaintext new password. The stored value must match the pattern `/^\$2[aby]?\$/`.
    - Verified by: test "stores the updated password as a bcrypt hash, not plaintext" — queries `db.prepare('SELECT password FROM users WHERE email = ?').get(user.email)`, asserts `row.password !== 'the-new-password2'` and `row.password.match(/^\$2[aby]?\$/)`.

## PATCH /api/users/me — email conflict is atomic

11. `PATCH /api/users/me` with an email already owned by a different user returns HTTP 409. When the body also includes a `username` change, neither the email nor the username is written — the update is fully atomic.
    - Verified by: test "returns 409 for an email already taken by another user, and leaves no field changed" — sends `{ username: 'renamed_before_conflict', email: taken.email }`, asserts `res.status === 409`; subsequent `GET /api/auth/me` confirms `username` is still `'wants_taken_email_user'` and `email` is still `'wants-taken-email@example.com'`.

## PATCH /api/users/me — username conflict

12. `PATCH /api/users/me` with a username already owned by a different user returns HTTP 409.
    - Verified by: test "returns 409 for a username already taken by another user" — sends `{ username: taken.username }`, asserts `res.status === 409`.

## password never returned in responses

13. The `password` field does not appear in any API response from `GET /api/auth/me` or `PATCH /api/users/me`.
    - Verified by: requirement 5 test asserts `res.body.user.password === undefined`; `pnpm --filter benchmark-backend vitest run` passes all 9 cases, none of which expect a `password` key in success responses.

## Zod schema

14. A Zod validation schema for the PATCH body exists at `src/benchmark-backend/src/schemas/userSchema.ts`. The schema treats all four fields (`username`, `email`, `currentPassword`, `newPassword`) as optional, rejects a body with none of them (driving a 400 response via the `validate` middleware), and enforces that `newPassword` can only be present when `currentPassword` is also present.
    - Verified by: tests for requirements 6 and 7 pass (schema feeds the `validate` middleware which returns 400 in both cases); `pnpm --filter benchmark-backend exec tsc --noEmit` exits 0.

## Atomic SQL update in userService

15. The `updateUser(userId, updates)` function in `src/benchmark-backend/src/services/userService.ts` performs uniqueness validation and all field writes as a single atomic SQL UPDATE (one statement). It does not do sequential per-field writes.
    - Verified by: requirement 11 test — after a 409, `GET /api/auth/me` shows the username is still the original value (proving no partial write occurred before the conflict check or after).

## File structure

16. The following files exist at the specified paths and export the required members:
    - `src/benchmark-backend/src/schemas/userSchema.ts` — exports a Zod schema (used by `validate` middleware)
    - `src/benchmark-backend/src/services/userService.ts` — exports `updateUser`
    - `src/benchmark-backend/src/controllers/userController.ts` — exports `updateMe` (or equivalent handler)
    - `src/benchmark-backend/src/routes/userRoutes.ts` — exports an Express Router with `PATCH /me` behind `requireJwt` and `validate`
    - `src/benchmark-backend/src/app.ts` — mounts `userRoutes` at `/api/users`
    - Verified by: `pnpm --filter benchmark-backend exec tsc --noEmit` exits 0 (missing exports or bad imports are type errors); `pnpm --filter benchmark-backend vitest run` exits 0 (runtime routing must work for integration tests to reach the endpoint).

## All visible tests pass

17. Running `pnpm --filter benchmark-backend vitest run` exits with code 0. All 9 test cases in `src/tests/visible/userProfile.test.ts` pass.
    - Verified by: terminal output reports 9 passed tests in `userProfile.test.ts` and 0 failures.

---

## Edge cases

- Spoofed `?id=` / `?userId=` query params on `GET /api/auth/me`: covered by requirement 3.
- `newPassword` supplied without `currentPassword` (field missing, not wrong): covered by requirement 7.
- Wrong `currentPassword` with an otherwise valid body: covered by requirement 8.
- Multi-field update where one field conflicts (e.g. username valid, email taken): full rollback — covered by requirement 11.
- Password stored as plaintext after update: prohibited — covered by requirement 10.
- `password` field leaked in any response body: prohibited — covered by requirement 13.
- Empty body `{}` vs body with only unrecognised keys: both must return 400 — covered by requirement 6.
