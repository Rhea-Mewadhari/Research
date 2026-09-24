# Requirements

## Database migration

1. The file `src/benchmark-backend/src/db/migrations/004_users.sql` exists and contains a `CREATE TABLE users` statement with exactly these columns: `id TEXT PRIMARY KEY`, `email TEXT NOT NULL UNIQUE`, `username TEXT NOT NULL UNIQUE`, `password TEXT NOT NULL`, `created_at TEXT NOT NULL DEFAULT (datetime('now'))`.
   - Verified by: `cat src/benchmark-backend/src/db/migrations/004_users.sql` matches the exact DDL from the task spec; `pnpm test` in `src/benchmark-backend` passes the "stores the password as a bcrypt hash" test which queries the `users` table by `email`.

## POST /api/auth/register — happy path

2. A valid `POST /api/auth/register` request (email in valid format, username non-empty, password ≥ 8 chars) returns HTTP 201 with a JSON body containing `user.id` (string), `user.email`, `user.username`, `user.createdAt` (string), and `token` (string); `user.password` is absent from the body.
   - Verified by: `src/benchmark-backend/src/tests/visible/auth.test.ts` — "registers a new user and returns 201 with a user object and token" passes.

3. The response body for a successful registration contains no occurrence of the submitted plaintext password at any level of the JSON structure.
   - Verified by: `auth.test.ts` — "never includes the password anywhere in the response body" passes.

4. After registration, the `password` column in the `users` table contains a bcrypt hash (matches `/^\$2[aby]?\$/`) and not the plaintext value.
   - Verified by: `auth.test.ts` — "stores the password as a bcrypt hash, not plaintext" passes.

5. The returned `token` is a valid JWT with three dot-separated segments; its decoded payload contains `userId` equal to `user.id`, `email`, and `username` claims.
   - Verified by: `auth.test.ts` — "issues a JWT carrying userId, email, and username claims" passes.

## POST /api/auth/register — validation failures

6. A registration request with `password` shorter than 8 characters returns HTTP 400.
   - Verified by: `auth.test.ts` — "rejects a password shorter than 8 characters with 400" passes.

7. A registration request with `password` omitted entirely returns HTTP 400.
   - Verified by: `auth.test.ts` — "rejects a missing password with 400" passes.

8. A registration request with an invalid email format (e.g. `"not-an-email"`) returns HTTP 400.
   - Verified by: `auth.test.ts` — "rejects an invalid email format with 400" passes.

## POST /api/auth/register — conflict errors

9. A registration attempt with an email that already exists in the `users` table returns HTTP 409 with JSON body `{ "error": "Email already registered" }` (exact string).
   - Verified by: `auth.test.ts` — "returns 409 \"Email already registered\" for a duplicate email" passes.

10. A registration attempt with a username that already exists in the `users` table returns HTTP 409 with JSON body `{ "error": "Username already taken" }` (exact string).
    - Verified by: `auth.test.ts` — "returns 409 \"Username already taken\" for a duplicate username" passes.

## POST /api/auth/login — happy path

11. A `POST /api/auth/login` request with a registered email and the correct password returns HTTP 200 with a JSON body containing `user.email`, `user.username` (no `user.password`), and `token` (string).
    - Verified by: `auth.test.ts` — "logs in with valid credentials and returns 200 with a user and token" passes.

## POST /api/auth/login — failure cases

12. A login request with a correct email but wrong password returns HTTP 401 with JSON body `{ "error": "Invalid credentials" }` (exact string).
    - Verified by: `auth.test.ts` — "returns 401 \"Invalid credentials\" for a wrong password" passes.

13. A login request with an email that does not exist in the `users` table returns HTTP 401 with JSON body `{ "error": "Invalid credentials" }` — the same message as a wrong password, with no information about whether the email exists.
    - Verified by: `auth.test.ts` — "returns 401 \"Invalid credentials\" for an unknown email (same message as a wrong password)" passes.

## GET /api/auth/me

14. A `GET /api/auth/me` request with a valid `Authorization: Bearer <token>` header returns HTTP 200 with a JSON body containing `email` and `username` but no `password` field.
    - Verified by: `auth.test.ts` — "returns the user object for a valid token, without the password field" passes.

15. A `GET /api/auth/me` request with no `Authorization` header returns HTTP 401.
    - Verified by: `auth.test.ts` — "returns 401 when no Authorization header is provided" passes.

16. A `GET /api/auth/me` request with a malformed or invalid token (e.g. `"Bearer not-a-real-jwt"`) returns HTTP 401.
    - Verified by: `auth.test.ts` — "returns 401 for a malformed or invalid token" passes.

## Technical constraints

17. The file `src/benchmark-backend/src/middleware/auth.ts` is not modified — its content is identical to the pre-task state.
    - Verified by: `git diff src/benchmark-backend/src/middleware/auth.ts` produces no output.

18. The JWT signing secret is read from `process.env.JWT_SECRET` and never hardcoded as a string literal in `authService.ts` or any other new file.
    - Verified by: `grep -n "process.env.JWT_SECRET" src/benchmark-backend/src/services/authService.ts` returns a match; no string literal replaces the env reference in the `sign()` call.

19. The three auth endpoints are mounted at `/api/auth` in `src/benchmark-backend/src/app.ts` via a dedicated router exported from `src/benchmark-backend/src/routes/authRoutes.ts`.
    - Verified by: `cat src/benchmark-backend/src/app.ts` contains `app.use('/api/auth', ...)` (or equivalent); `src/benchmark-backend/src/routes/authRoutes.ts` exists.

20. Request validation for register and login uses Zod schemas defined in `src/benchmark-backend/src/schemas/authSchema.ts` (following the existing `src/schemas/` pattern).
    - Verified by: `src/benchmark-backend/src/schemas/authSchema.ts` exists and exports at least one Zod schema; the auth controller or router imports from this file.

21. JWT verification for `GET /api/auth/me` is handled by a new middleware at `src/benchmark-backend/src/middleware/requireJwt.ts` (not by the existing `requireAuth` in `auth.ts`).
    - Verified by: `src/benchmark-backend/src/middleware/requireJwt.ts` exists; `src/benchmark-backend/src/routes/authRoutes.ts` imports from `requireJwt.ts`.

22. The entire visible test suite (`pnpm test` from `src/benchmark-backend`) exits with code 0 and all tests in `auth.test.ts` and `products.test.ts` are reported as passed.
    - Verified by: `cd src/benchmark-backend && pnpm test` completes with exit code 0.

## Edge cases

- Empty string for `email`, `username`, or `password`: covered by requirements 6–8 (Zod validation rejects them the same way it rejects missing/invalid values).
- JWT `exp` claim set to 24 hours: not directly asserted by visible tests, but the `requireJwt` middleware must reject expired tokens — covered by requirement 16 (invalid token → 401).
- `password` field absent from `GET /api/auth/me` response body: covered by requirement 14.
- `requireJwt` is a new file separate from `requireAuth`: covered by requirement 17 (auth.ts unmodified) and requirement 21 (requireJwt.ts exists).
- Duplicate email vs. duplicate username returning distinct 409 messages: covered individually by requirements 9 and 10.
- All error paths flow through the existing `errorHandler` middleware: implicitly verified by requirement 22 — if errors were swallowed or not propagated via `next(err)`, the error-case tests (400, 401, 409) would return unexpected status codes and the suite would fail.
