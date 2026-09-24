# Requirements

## Database

1. A migration file `src/db/migrations/004_users.sql` exists and creates a `users` table with columns: `id TEXT PRIMARY KEY`, `email TEXT NOT NULL UNIQUE`, `username TEXT NOT NULL UNIQUE`, `password TEXT NOT NULL`, `created_at TEXT NOT NULL DEFAULT (datetime('now'))`.
   - Verified by: `migrate.ts` reads all `.sql` files in alphabetical order; running the test suite with an in-memory DB applies this migration; the query `SELECT password FROM users WHERE email = ?` in `auth.test.ts` line 61 must return a row — if the table doesn't exist, the test throws "no such table: users".

2. The migration is picked up automatically by the existing `runMigrations()` in `src/db/migrate.ts` — no changes to `migrate.ts` or `client.ts` are needed.
   - Verified by: running `pnpm --filter benchmark-backend test` exercises the migration on app import; all `auth.test.ts` DB assertions pass without manually calling any setup beyond what the existing app bootstrap already does.

## POST /api/auth/register

3. The endpoint `POST /api/auth/register` is mounted and reachable (not 404).
   - Verified by: `auth.test.ts` line 26 — supertest receives HTTP 201, not 404 or 500.

4. A request with valid `email`, `username`, and `password` (≥ 8 chars, unique values) responds with HTTP 201 and a JSON body `{ user: { id, email, username, createdAt }, token }` where `id` is a non-empty string, `createdAt` is a non-empty string, and `token` is a non-empty string.
   - Verified by: `auth.test.ts` lines 25–41 — asserts `res.status === 201`, `res.body.user.email`, `res.body.user.username`, `res.body.user.id` (any string), `res.body.user.createdAt` (any string), `res.body.token` (any string).

5. The `password` field is absent from the response: `res.body.user.password` is `undefined` and the full serialised body string does not contain the plaintext password value.
   - Verified by: `auth.test.ts` line 39 — `expect(res.body.user.password).toBeUndefined()`; `auth.test.ts` lines 43–51 — `expect(JSON.stringify(res.body)).not.toContain('plaintext-secret')`.

6. The password is stored in the database as a bcrypt hash — the stored value starts with `$2a$`, `$2b$`, or `$2y$` and is never the plaintext password.
   - Verified by: `auth.test.ts` lines 53–67 — direct DB query `SELECT password FROM users WHERE email = ?` asserts `row.password !== 'plaintext-secret'` and `row.password.match(/^\$2[aby]?\$/)`.

7. The JWT returned by register is a three-segment dot-separated string. Its decoded payload contains the claims `userId` (equal to `res.body.user.id`), `email`, and `username`.
   - Verified by: `auth.test.ts` lines 69–83 — `token.split('.').length === 3`, `payload.userId === res.body.user.id`, `payload.email === 'claims@example.com'`, `payload.username === 'claims_user'`.

8. A `password` value shorter than 8 characters responds with HTTP 400.
   - Verified by: `auth.test.ts` lines 85–93 — password `'short1'` (6 chars) → `res.status === 400`.

9. A request body missing the `password` field responds with HTTP 400.
   - Verified by: `auth.test.ts` lines 95–102 — body `{ email, username }` with no `password` → `res.status === 400`.

10. A malformed email (not a valid email format) responds with HTTP 400.
    - Verified by: `auth.test.ts` lines 104–112 — email `'not-an-email'` → `res.status === 400`.

11. A duplicate email responds with HTTP 409 and JSON body `{ "error": "Email already registered" }` (exact string).
    - Verified by: `auth.test.ts` lines 114–129 — second registration with the same email → `res.status === 409`, `res.body.error === 'Email already registered'`.

12. A duplicate username responds with HTTP 409 and JSON body `{ "error": "Username already taken" }` (exact string).
    - Verified by: `auth.test.ts` lines 131–146 — second registration with the same username → `res.status === 409`, `res.body.error === 'Username already taken'`.

## POST /api/auth/login

13. The endpoint `POST /api/auth/login` is mounted and reachable.
    - Verified by: `auth.test.ts` line 162 — supertest receives HTTP 200, not 404.

14. A request with a registered email and correct password responds with HTTP 200 and a JSON body `{ user: { id, email, username, createdAt }, token }` with no `password` field on the user object.
    - Verified by: `auth.test.ts` lines 160–171 — `res.status === 200`, `res.body.user.email`, `res.body.user.username`, `res.body.user.password === undefined`, `res.body.token` (any string).

15. A request with a correct email but wrong password responds with HTTP 401 and `{ "error": "Invalid credentials" }` (exact string).
    - Verified by: `auth.test.ts` lines 173–181 — `res.status === 401`, `res.body.error === 'Invalid credentials'`.

16. A request with an email that has no matching account responds with HTTP 401 and `{ "error": "Invalid credentials" }` — the same message as a wrong password (no information leakage about whether the email exists).
    - Verified by: `auth.test.ts` lines 183–191 — `res.status === 401`, `res.body.error === 'Invalid credentials'`.

## GET /api/auth/me

17. The endpoint `GET /api/auth/me` is mounted and reachable.
    - Verified by: `auth.test.ts` line 209 — supertest receives HTTP 200, not 404.

18. A request with `Authorization: Bearer <valid-jwt>` responds with HTTP 200 and the user object `{ id, email, username, createdAt }` with no `password` field.
    - Verified by: `auth.test.ts` lines 207–216 — `res.status === 200`, `res.body.email === ME_USER.email`, `res.body.username === ME_USER.username`, `res.body.password === undefined`.

19. A request with no `Authorization` header responds with HTTP 401.
    - Verified by: `auth.test.ts` lines 218–221 — `res.status === 401`.

20. A request with `Authorization: Bearer not-a-real-jwt` (malformed/invalid token) responds with HTTP 401.
    - Verified by: `auth.test.ts` lines 223–229 — `res.status === 401`.

## requireJwt Middleware

21. A new `src/middleware/requireJwt.ts` file exports a middleware function that extracts the Bearer token from the `Authorization` header, verifies it with `process.env.JWT_SECRET` via `jsonwebtoken`, attaches the decoded payload to the request object, and calls `next()` on success. On missing, malformed, or invalid token it responds with HTTP 401.
    - Verified by: requirements 18–20 pass end-to-end; `GET /api/auth/me` without a header or with a bad token returns 401.

22. The existing `src/middleware/auth.ts` (`requireAuth`) is not modified.
    - Verified by: `git diff src/benchmark-backend/src/middleware/auth.ts` shows no changes; the existing product endpoint tests still pass.

## Zod Schemas

23. A new `src/schemas/authSchema.ts` exports `registerSchema` (Zod object: `email` as valid email format, `username` as non-empty string, `password` as string min length 8) and `loginSchema` (Zod object: `email` as valid email, `password` as non-empty string).
    - Verified by: validation-failure tests (requirements 8–10) return 400 via the existing `errorHandler`; TypeScript compilation (`pnpm tsc --noEmit`) succeeds with no errors in the new files.

## JWT Configuration

24. `JWT_SECRET` is read from `process.env.JWT_SECRET` in every signing and verification call. It is not hardcoded as a string literal in any source file.
    - Verified by: `grep -rn "JWT_SECRET" src/benchmark-backend/src/` returns only `process.env.JWT_SECRET` references; no bare secret string appears.

25. The JWT is signed with an expiry of 24 hours (`{ expiresIn: '24h' }` or equivalent).
    - Verified by: decoding the token issued by register confirms the `exp` claim is approximately `iat + 86400`; this is implicitly checked by the `auth.test.ts` JWT payload assertions passing.

## app.ts Modification

26. `src/app.ts` imports `authRoutes` and mounts it at `/api/auth`, placed before the catch-all 404 handler and the `errorHandler`.
    - Verified by: `grep "authRoutes\|/api/auth" src/benchmark-backend/src/app.ts` returns matching lines; all three auth endpoints are reachable (requirements 3, 13, 17).

## File Creation

27. All six new files are created: `src/db/migrations/004_users.sql`, `src/schemas/authSchema.ts`, `src/services/authService.ts`, `src/middleware/requireJwt.ts`, `src/controllers/authController.ts`, `src/routes/authRoutes.ts`.
    - Verified by: `ls src/benchmark-backend/src/db/migrations/004_users.sql src/benchmark-backend/src/schemas/authSchema.ts src/benchmark-backend/src/services/authService.ts src/benchmark-backend/src/middleware/requireJwt.ts src/benchmark-backend/src/controllers/authController.ts src/benchmark-backend/src/routes/authRoutes.ts` all resolve without "No such file" errors.

## Full Test Suite

28. Running `pnpm --filter benchmark-backend test` exits 0 with all `auth.test.ts` cases passing and no regressions in other test files (products, favourites, etc.).
    - Verified by: `pnpm --filter benchmark-backend test` terminal output shows all tests pass with 0 failures.

---

## Edge cases

- **Missing email or username on register**: covered by requirement 9 (same Zod validation path returns 400 for any missing required field).
- **Empty string password**: length 0 < 8, covered by requirement 8 → 400.
- **Token signed with wrong secret**: `jsonwebtoken.verify` throws `JsonWebTokenError`; covered by requirement 20 → 401.
- **Expired token**: `jsonwebtoken.verify` throws `TokenExpiredError`; same code path as requirement 20 → 401.
- **Duplicate email and username simultaneously**: the first UNIQUE constraint violation encountered is returned; whichever fires first returns its 409 message. Both messages are verified independently in requirements 11 and 12.
- **Rate-limiter interaction**: `auth.test.ts` mocks `rateLimiter` (lines 7–9) to prevent 429s across rapid sequential requests; no change to the rate-limiter implementation is needed.
- **Password never in any response**: both the `user` object and the entire serialised JSON body are checked in requirement 5; the login response is checked in requirement 14 (`res.body.user.password === undefined`).
