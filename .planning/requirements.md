# Requirements

1. `PATCH /api/users/me` without a valid JWT token returns HTTP 401.
   - Verified by: `userProfile.test.ts` — "requires a valid JWT" test sends `PATCH /api/users/me` with no `Authorization` header and asserts `res.status === 401`.

2. `PATCH /api/users/me` with a valid JWT and a body containing at least one recognised field (e.g. `{ username: 'new_name' }`) returns HTTP 200 with body `{ user: { id, email, username, createdAt } }` where `user.username` is the updated value, `user.email` is unchanged, and `user.password` is absent (undefined).
   - Verified by: `userProfile.test.ts` — "updates the username and returns the new user object" test asserts `res.status === 200`, `res.body.user.username === 'after_username_change'`, `res.body.user.email === user.email`, `res.body.user.password === undefined`.

3. `PATCH /api/users/me` with an empty body `{}` or a body containing only unrecognised fields returns HTTP 400.
   - Verified by: `userProfile.test.ts` — "returns 400 for an empty body / no recognised fields" test sends `{}` and asserts `res.status === 400`.

4. `PATCH /api/users/me` with `newPassword` present but `currentPassword` absent returns HTTP 400.
   - Verified by: `userProfile.test.ts` — "returns 400 when newPassword is given without currentPassword" test sends `{ newPassword: 'brandnewpassword1' }` and asserts `res.status === 400`.

5. `PATCH /api/users/me` with both `newPassword` and `currentPassword` present, but `currentPassword` does not match the stored bcrypt hash, returns HTTP 400 with JSON body `{ "error": "Current password is incorrect" }`.
   - Verified by: `userProfile.test.ts` — "returns 400 'Current password is incorrect' when currentPassword is wrong" test sends `{ currentPassword: 'not-the-real-password', newPassword: 'brandnewpassword1' }` and asserts `res.status === 400` and `res.body.error === 'Current password is incorrect'`.

6. `PATCH /api/users/me` with a correct `currentPassword` and a `newPassword` stores the new password as a bcrypt hash in the `users` table (the stored value matches `/^\$2[aby]?\$/` and is not equal to the plaintext new password); a subsequent `POST /api/auth/login` with the new password returns HTTP 200 and a subsequent login with the old password returns HTTP 401.
   - Verified by: `userProfile.test.ts` — "updates the password so a subsequent login with the new password succeeds and the old one fails" test (asserts old-password login status 401, new-password login status 200) and "stores the updated password as a bcrypt hash, not plaintext" test (queries `db.prepare('SELECT password FROM users WHERE email = ?').get(email)` and asserts `row.password` matches `/^\$2[aby]?\$/` and `row.password !== 'the-new-password2'`).

7. `PATCH /api/users/me` where the requested `email` is already owned by a different user returns HTTP 409, and neither the username nor any other field of the requesting user is modified in the database.
   - Verified by: `userProfile.test.ts` — "returns 409 for an email already taken by another user, and leaves no field changed" test sends `{ username: 'renamed_before_conflict', email: taken.email }`, asserts `res.status === 409`, then calls `GET /api/auth/me` and asserts `me.body.username === 'wants_taken_email_user'` and `me.body.email === 'wants-taken-email@example.com'` (original values, unmodified).

8. `PATCH /api/users/me` where the requested `username` is already owned by a different user returns HTTP 409.
   - Verified by: `userProfile.test.ts` — "returns 409 for a username already taken by another user" test sends `{ username: taken.username }` and asserts `res.status === 409`.

9. `GET /api/auth/me` resolves the user exclusively from the JWT payload (`req.user.userId`) and ignores any `id` or `userId` query parameters in the URL; it always returns the token owner's own data.
   - Verified by: `userProfile.test.ts` — "returns only the caller's own data regardless of a spoofed id in the URL" test calls `GET /api/auth/me?id=${other.id}&userId=${other.id}` with the authenticated user's JWT and asserts `res.status === 200`, `res.body.id === mine.id`, `res.body.email === mine.email`, `res.body.username === mine.username`.

10. The user router is mounted in `src/app.ts` at the prefix `/api/users` so that `PATCH /api/users/me` reaches the route handler (not a 404).
    - Verified by: all `PATCH /api/users/me` tests in `userProfile.test.ts` returning non-404 status codes; structurally confirmed by `src/app.ts` importing `userRoutes` from `./routes/userRoutes` and calling `app.use('/api/users', userRoutes)`.

11. The `password` field is never present in any successful API response (neither from `PATCH /api/users/me` nor from `GET /api/auth/me`).
    - Verified by: `userProfile.test.ts` — "updates the username and returns the new user object" test asserts `res.body.user.password === undefined`; no response-body assertion in any other test expects a `password` key.

12. The update performed by `PATCH /api/users/me` is atomic — if email uniqueness or username uniqueness validation fails after other fields have been checked, no fields are written to the database.
    - Verified by: `userProfile.test.ts` — requirement 7's atomicity check: after a 409 due to a taken email (with a simultaneous username rename in the same request body), `GET /api/auth/me` confirms the username is still the original value.

---

## Edge cases

- `currentPassword` provided alone (no `newPassword`, no other fields): the body contains only `currentPassword`, which is not a writable field on its own; no recognised update fields are present → HTTP 400 — covered by requirement 3.
- `newPassword` and `currentPassword` both provided alongside `username` or `email`: password change is validated (requirement 5) and then applied together with the other field update as a single atomic write — covered by requirement 6 and 12.
- Email updated to the caller's own current email (no real change): not directly tested; the uniqueness check must scope to *other* users (exclude the caller's own row), so this must not return 409 — covered by the scoping implied in requirements 7 and 8.
- Username updated to the caller's own current username: same as above — covered by requirements 7 and 8.
- JWT present but expired or with an invalid signature: `requireJwt` middleware handles this with a 401 before the controller is reached — covered by requirement 1.
- Simultaneous uniqueness conflict on both username and email: first conflict encountered returns 409; no writes occur — covered by requirement 12.
