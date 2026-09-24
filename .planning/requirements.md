# Requirements

Target: backend (Task 13 — User Profile Management, backend portion only)

## GET /api/auth/me ownership

1. `GET /api/auth/me` resolves the authenticated user strictly from `req.user.userId` (the decoded JWT payload). Any `id` or `userId` values supplied in the URL query string are ignored; the response always contains the token owner's own data.
   - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "returns only the caller's own data regardless of a spoofed id in the URL": request carries `?id=<other.id>&userId=<other.id>` with `mine`'s token → HTTP 200, `res.body.id === mine.id`, `res.body.email === mine.email`, `res.body.username === mine.username`.

## PATCH /api/users/me — authentication

2. `PATCH /api/users/me` returns HTTP 401 when the request carries no valid JWT.
   - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "requires a valid JWT": no `Authorization` header → `res.status === 401`.

## PATCH /api/users/me — successful update

3. `PATCH /api/users/me` with `{ username: "<new>" }` returns HTTP 200 with body `{ user: { id, email, username, createdAt } }`. The updated `username` appears in `user.username`. The `password` field must not appear anywhere in `res.body`.
   - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "updates the username and returns the new user object": `res.status === 200`, `res.body.user.username === 'after_username_change'`, `res.body.user.email === user.email`, `res.body.user.password === undefined`.

## PATCH /api/users/me — validation errors (400)

4. `PATCH /api/users/me` with an empty body (`{}`) returns HTTP 400.
   - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "returns 400 for an empty body / no recognised fields": `res.status === 400`.

5. `PATCH /api/users/me` with `{ newPassword: "..." }` but no `currentPassword` field returns HTTP 400.
   - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "returns 400 when newPassword is given without currentPassword": `res.status === 400`.

6. `PATCH /api/users/me` with `{ currentPassword: "<wrong>", newPassword: "<new>" }` where `currentPassword` does not match the stored hash returns HTTP 400 with body `{ "error": "Current password is incorrect" }`.
   - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "returns 400 'Current password is incorrect' when currentPassword is wrong": `res.status === 400`, `res.body.error === 'Current password is incorrect'`.

## PATCH /api/users/me — password update

7. `PATCH /api/users/me` with a correct `currentPassword` and a `newPassword` returns HTTP 200. A subsequent `POST /api/auth/login` with the old password returns 401; with the new password returns 200.
   - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "updates the password so a subsequent login with the new password succeeds and the old one fails": `patchRes.status === 200`, `oldLogin.status === 401`, `newLogin.status === 200`.

8. After a password update, the `password` column in the `users` table contains a bcrypt hash (value matches `/^\$2[aby]?\$/`) and is not equal to the plaintext new password.
   - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "stores the updated password as a bcrypt hash, not plaintext": direct DB query `db.prepare('SELECT password FROM users WHERE email = ?').get(email)` → `row.password !== 'the-new-password2'` AND `row.password.match(/^\$2[aby]?\$/)` is truthy.

## PATCH /api/users/me — uniqueness conflicts (409)

9. `PATCH /api/users/me` with an `email` already registered to another user returns HTTP 409. No field of the requesting user is changed (atomicity): a follow-up `GET /api/auth/me` returns the original `username` and `email`.
   - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "returns 409 for an email already taken by another user, and leaves no field changed": `res.status === 409`; then `GET /api/auth/me` → `me.body.username === 'wants_taken_email_user'` and `me.body.email === 'wants-taken-email@example.com'`.

10. `PATCH /api/users/me` with a `username` already registered to another user returns HTTP 409.
    - Verified by: `src/benchmark-backend/src/tests/visible/userProfile.test.ts` — test "returns 409 for a username already taken by another user": `res.status === 409`.

## New files and structure

11. `src/benchmark-backend/src/schemas/userSchema.ts` exports a Zod schema for the PATCH request body: all four fields (`username`, `email`, `currentPassword`, `newPassword`) are optional strings, but at least one field in `{ username, email, newPassword }` must be present (pure `currentPassword`-only body is treated as no recognised update field → 400); when `newPassword` is present, `currentPassword` must also be present.
    - Verified by: requirements 4 and 5 pass (Zod schema rejection produces the 400 responses those tests assert).

12. `src/benchmark-backend/src/services/userService.ts` exports an `updateUser` function that performs the entire profile update in a single atomic SQL `UPDATE` statement. No partial write occurs if a validation step (password check, uniqueness check) fails before the write.
    - Verified by: requirement 9 passes — the atomicity assertion (`GET /api/auth/me` after a 409 still shows original values) confirms no partial column mutation.

13. `src/benchmark-backend/src/routes/userRoutes.ts` defines and exports an Express router that mounts `PATCH /me` with `requireJwt` middleware followed by the patch controller. `src/benchmark-backend/src/app.ts` mounts this router at prefix `/api/users`.
    - Verified by: requirements 2–10 all pass (they are only reachable if the route is registered and protected correctly); `pnpm test` in `src/benchmark-backend` exits 0.

## Full test suite

14. Running `pnpm test` from `src/benchmark-backend` exits with code 0. All tests in `src/tests/visible/userProfile.test.ts` pass. No regressions in `src/tests/visible/auth.test.ts` or any other existing test file.
    - Verified by: terminal output of `pnpm test` shows 0 failed tests, with `userProfile.test.ts` fully green.

---

## Edge cases

- **Spoofed URL params on GET /api/auth/me**: `?id=<other>&userId=<other>` must not affect which user is returned — covered by requirement 1.
- **`currentPassword` supplied alone (no `newPassword`, no `username`, no `email`)**: no update field is present; treated identically to an empty body → 400 — covered by requirement 4 (schema must not count `currentPassword` alone as a valid update).
- **Uniqueness check must not false-positive on the user's own current value**: if a user sends their own existing email or username, it must not conflict with themselves — not explicitly tested by the visible tests but implied by requirements 9 and 10 (the conflict must be detected only against *other* users' rows).
- **Password never in any API response**: requirements 3, 7, and 9 all assert `res.body.user.password === undefined` or equivalent — the service and controller must strip the `password` column before responding.
- **No modification to `requireJwt` or Task 12 auth logic**: `src/middleware/requireJwt.ts` and `src/services/authService.ts` are not changed — covered by requirement 14 (no regressions in `auth.test.ts`).
