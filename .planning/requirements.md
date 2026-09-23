# Requirements

## Database Migration

1. A file `src/db/migrations/004_users.sql` exists and contains a `CREATE TABLE users` statement with columns `id TEXT PRIMARY KEY`, `email TEXT NOT NULL UNIQUE`, `username TEXT NOT NULL UNIQUE`, `password TEXT NOT NULL`, and `created_at TEXT NOT NULL DEFAULT (datetime('now'))`.
   - Verified by: file present on disk; `pnpm test` in `src/benchmark-backend` runs the in-memory migration on each test run — a `users` table query in `auth.test.ts` (e.g. `db.prepare('SELECT password FROM users WHERE email = ?').get(...)`) succeeds without "no such table" error.

## POST /api/auth/register — Success path

2. `POST /api/auth/register` with valid `{ email, username, password }` returns HTTP 201 with a body of shape `{ user: { id, email, username, createdAt }, token }` where `id` is a non-empty string, `email` and `username` match the input, `createdAt` is a non-empty string, and `token` is a non-empty string.
   - Verified by: `auth.test.ts` — "registers a new user and returns 201 with a user object and token" test passes.

3. The `password` field is absent from the entire JSON response body of `POST /api/auth/register` — the stringified response must not contain the plaintext password submitted in the request.
   - Verified by: `auth.test.ts` — "never includes the password anywhere in the response body" test passes (checks `JSON.stringify(res.body)` does not contain `'plaintext-secret'`).

4. After a successful `POST /api/auth/register`, the password stored in the `users` table for that email is a bcrypt hash — it starts with `$2a$`, `$2b$`, or `$2y$` and is not equal to the plaintext password.
   - Verified by: `auth.test.ts` — "stores the password as a bcrypt hash, not plaintext" test passes (queries `db.prepare('SELECT password FROM users WHERE email = ?').get(...)` and checks the `password` column matches `/^\$2[aby]?\$/` and is not equal to `'plaintext-secret'`).

5. The JWT returned by `POST /api/auth/register` is a three-part dot-delimited string; decoding its base64url payload produces an object containing `userId` equal to the returned `user.id`, `email` equal to the submitted email, and `username` equal to the submitted username.
   - Verified by: `auth.test.ts` — "issues a JWT carrying userId, email, and username claims" test passes.

## POST /api/auth/register — Validation errors

6. `POST /api/auth/register` with a `password` shorter than 8 characters returns HTTP 400.
   - Verified by: `auth.test.ts` — "rejects a password shorter than 8 characters with 400" test passes (`res.status === 400`).

7. `POST /api/auth/register` with the `password` field missing entirely returns HTTP 400.
   - Verified by: `auth.test.ts` — "rejects a missing password with 400" test passes (`res.status === 400`).

8. `POST /api/auth/register` with an `email` that is not a valid email address (e.g. `"not-an-email"`) returns HTTP 400.
   - Verified by: `auth.test.ts` — "rejects an invalid email format with 400" test passes (`res.status === 400`).

## POST /api/auth/register — Conflict errors

9. `POST /api/auth/register` with an `email` that already exists in the `users` table returns HTTP 409 with a body containing `{ "error": "Email already registered" }`.
   - Verified by: `auth.test.ts` — "returns 409 'Email already registered' for a duplicate email" test passes (`res.status === 409` and `res.body.error === 'Email already registered'`).

10. `POST /api/auth/register` with a `username` that already exists in the `users` table (but with a different email) returns HTTP 409 with a body containing `{ "error": "Username already taken" }`.
    - Verified by: `auth.test.ts` — "returns 409 'Username already taken' for a duplicate username" test passes (`res.status === 409` and `res.body.error === 'Username already taken'`).

## POST /api/auth/login — Success path

11. `POST /api/auth/login` with a valid `{ email, password }` for a registered user returns HTTP 200 with a body of shape `{ user: { id, email, username, createdAt }, token }` where `user.email` matches the registered user's email, `user.username` matches the registered username, and `token` is a non-empty string. The `password` field is absent from `user`.
    - Verified by: `auth.test.ts` — "logs in with valid credentials and returns 200 with a user and token" test passes.

## POST /api/auth/login — Error paths

12. `POST /api/auth/login` with an existing email but an incorrect password returns HTTP 401 with a body containing `{ "error": "Invalid credentials" }`.
    - Verified by: `auth.test.ts` — "returns 401 'Invalid credentials' for a wrong password" test passes (`res.status === 401` and `res.body.error === 'Invalid credentials'`).

13. `POST /api/auth/login` with an email address that does not exist in the `users` table returns HTTP 401 with a body containing `{ "error": "Invalid credentials" }` — the error message is identical to requirement 12, revealing no information about whether the email exists.
    - Verified by: `auth.test.ts` — "returns 401 'Invalid credentials' for an unknown email (same message as a wrong password)" test passes (`res.status === 401` and `res.body.error === 'Invalid credentials'`).

## GET /api/auth/me — Success path

14. `GET /api/auth/me` with a valid `Authorization: Bearer <jwt>` header (where the JWT was issued by this service) returns HTTP 200 with a body containing the user's `email`, `username`, and other non-password fields — `password` is absent from the response body.
    - Verified by: `auth.test.ts` — "returns the user object for a valid token, without the password field" test passes (`res.status === 200`, `res.body.email` matches, `res.body.username` matches, `res.body.password` is `undefined`).

## GET /api/auth/me — Error paths

15. `GET /api/auth/me` with no `Authorization` header returns HTTP 401.
    - Verified by: `auth.test.ts` — "returns 401 when no Authorization header is provided" test passes (`res.status === 401`).

16. `GET /api/auth/me` with a malformed or invalid JWT (e.g. `"Bearer not-a-real-jwt"`) in the `Authorization` header returns HTTP 401.
    - Verified by: `auth.test.ts` — "returns 401 for a malformed or invalid token" test passes (`res.status === 401`).

## Middleware and Route Wiring

17. A `requireJwt` middleware exists at `src/middleware/requireJwt.ts`. It reads the `Authorization: Bearer <token>` header, verifies the token using `process.env.JWT_SECRET`, attaches the decoded payload to `req.user` (containing at minimum `userId`, `email`, `username`), calls `next()` on success, and responds with HTTP 401 on missing or invalid token. It is entirely separate from `src/middleware/auth.ts` (`requireAuth`) — `auth.ts` is not modified.
    - Verified by: file `src/middleware/requireJwt.ts` exists on disk; `git diff src/middleware/auth.ts` shows no changes; the `/api/auth/me` tests exercise this middleware and pass.

18. `src/app.ts` mounts the auth router at `/api/auth` so that `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me` are reachable, and the `errorHandler` middleware is still the last middleware in the chain.
    - Verified by: all `auth.test.ts` suites pass (the routes must be reachable); `pnpm test` exits with code 0.

## JWT Technical Constraints

19. The JWT is signed with the value of `process.env.JWT_SECRET` and has an expiry of 24 hours (`expiresIn: '24h'`). The secret is not hardcoded anywhere in source files.
    - Verified by: code inspection of `src/services/authService.ts` — no string literal is used as the JWT secret; the `expiresIn` option is `'24h'` (or equivalent in seconds); `grep -r 'JWT_SECRET' src/` finds only `process.env.JWT_SECRET` usage.

## TypeScript Standards

20. `src/types/express.d.ts` declares `req.user` on the Express `Request` interface with at minimum `userId: string`, `email: string`, and `username: string` fields, so that `requireJwt` attaches a typed value.
    - Verified by: `pnpm tsc --noEmit` in `src/benchmark-backend` exits with code 0 (TypeScript compilation succeeds with no errors across all new and modified files).

21. No existing test file is modified.
    - Verified by: `git diff --name-only` shows no files under `src/benchmark-backend/src/tests/`.

22. All visible auth tests pass without modifying test files.
    - Verified by: `pnpm test` in `src/benchmark-backend` exits with code 0 and all test cases in `src/tests/visible/auth.test.ts` are reported as passing.

---

## Edge Cases

- Missing `email` or `username` in register body (not just password): covered by requirement 6/7 pattern — Zod schema must validate all three fields present and non-empty; returns 400.
- Duplicate conflict checked for email before username (or vice versa): both are tested independently in requirements 9 and 10; both must return correct 409 message regardless of check order.
- `Authorization` header present but does not start with `Bearer ` (e.g. `"Token abc"`): covered by requirement 16 — no valid Bearer token means 401.
- Expired JWT passed to `GET /api/auth/me`: covered by requirement 16 — `jsonwebtoken` throws on expired tokens, which should produce 401.
- `JWT_SECRET` environment variable absent at runtime: not tested in visible tests; document that `requireJwt` will throw and the `errorHandler` will catch it as a 500, which is acceptable for this task's scope.
