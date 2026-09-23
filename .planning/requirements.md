# Requirements

## Database Migration

1. A file `src/benchmark-backend/src/db/migrations/004_users.sql` exists and contains a `CREATE TABLE users` DDL with exactly these columns: `id TEXT PRIMARY KEY`, `email TEXT NOT NULL UNIQUE`, `username TEXT NOT NULL UNIQUE`, `password TEXT NOT NULL`, `created_at TEXT NOT NULL DEFAULT (datetime('now'))`.
   - Verified by: the file is present and its content matches the schema in task12.md; `auth.test.ts` line 61 queries `SELECT password FROM users WHERE email = ?` — the test suite errors on startup if the table does not exist.

---

## POST /api/auth/register

2. A valid registration request (`email`, `username`, `password` >= 8 chars, well-formed email) returns HTTP 201 with body `{ user: { id: string, email, username, createdAt: string }, token: string }`.
   - Verified by: `auth.test.ts` — "registers a new user and returns 201 with a user object and token" asserts `res.status === 201`, `res.body.user` matches `{ email, username }`, `res.body.user.id` is a string, `res.body.user.createdAt` is a string, `res.body.token` is a string.

3. The `password` field never appears in the register response body, and the plaintext password is not present anywhere in `JSON.stringify(res.body)`.
   - Verified by: `auth.test.ts` — "never includes the password anywhere in the response body" asserts `res.body.user.password` is `undefined` and `JSON.stringify(res.body)` does not contain the plaintext `'plaintext-secret'`.

4. The password stored in the `users` table is a bcrypt hash (begins with `$2a$`, `$2b$`, or `$2y$`), not the original plaintext.
   - Verified by: `auth.test.ts` — "stores the password as a bcrypt hash, not plaintext" queries `SELECT password FROM users WHERE email = ?` and asserts `row.password !== 'plaintext-secret'` and `row.password` matches `/^\$2[aby]?\$/`.

5. The `token` in the register response is a three-part JWT (dot-separated) whose decoded payload contains claims `userId` (equal to `res.body.user.id`), `email`, and `username`.
   - Verified by: `auth.test.ts` — "issues a JWT carrying userId, email, and username claims" splits the token on `.`, expects 3 parts, decodes the middle segment and asserts `payload.userId === res.body.user.id`, `payload.email === 'claims@example.com'`, `payload.username === 'claims_user'`.

6. A registration request with a `password` shorter than 8 characters returns HTTP 400.
   - Verified by: `auth.test.ts` — "rejects a password shorter than 8 characters with 400" sends `password: 'short1'` and asserts `res.status === 400`.

7. A registration request with the `password` field omitted returns HTTP 400.
   - Verified by: `auth.test.ts` — "rejects a missing password with 400" sends no `password` key and asserts `res.status === 400`.

8. A registration request with a malformed email (e.g. `'not-an-email'`) returns HTTP 400.
   - Verified by: `auth.test.ts` — "rejects an invalid email format with 400" sends `email: 'not-an-email'` and asserts `res.status === 400`.

9. A registration attempt with an email that already exists in the `users` table returns HTTP 409 with body `{ "error": "Email already registered" }` (exact string).
   - Verified by: `auth.test.ts` — "returns 409 'Email already registered' for a duplicate email" registers the same email twice; the second call must return `res.status === 409` and `res.body.error === 'Email already registered'`.

10. A registration attempt with a username that already exists in the `users` table returns HTTP 409 with body `{ "error": "Username already taken" }` (exact string).
    - Verified by: `auth.test.ts` — "returns 409 'Username already taken' for a duplicate username" registers the same username twice; the second call must return `res.status === 409` and `res.body.error === 'Username already taken'`.

---

## POST /api/auth/login

11. A login request with a valid `{ email, password }` pair returns HTTP 200 with body `{ user: { id, email, username, createdAt }, token: string }` and `user.password` is absent.
    - Verified by: `auth.test.ts` — "logs in with valid credentials and returns 200 with a user and token" asserts `res.status === 200`, `res.body.user.email` and `res.body.user.username` match the registered values, `res.body.user.password` is `undefined`, `res.body.token` is a string.

12. A login request with a correct email but wrong password returns HTTP 401 with body `{ "error": "Invalid credentials" }` (exact string).
    - Verified by: `auth.test.ts` — "returns 401 'Invalid credentials' for a wrong password" asserts `res.status === 401` and `res.body.error === 'Invalid credentials'`.

13. A login request with an email that does not exist returns HTTP 401 with body `{ "error": "Invalid credentials" }` — the same message as a wrong password; the two cases are indistinguishable from the response.
    - Verified by: `auth.test.ts` — "returns 401 'Invalid credentials' for an unknown email (same message as a wrong password)" asserts `res.status === 401` and `res.body.error === 'Invalid credentials'`.

---

## GET /api/auth/me

14. `GET /api/auth/me` with a valid `Authorization: Bearer <token>` header returns HTTP 200 with the user object (`{ id, email, username, createdAt }`), and `password` is absent from the response body.
    - Verified by: `auth.test.ts` — "returns the user object for a valid token, without the password field" asserts `res.status === 200`, `res.body.email` and `res.body.username` match the registered values, `res.body.password` is `undefined`.

15. `GET /api/auth/me` with no `Authorization` header returns HTTP 401.
    - Verified by: `auth.test.ts` — "returns 401 when no Authorization header is provided" sends no header and asserts `res.status === 401`.

16. `GET /api/auth/me` with an `Authorization: Bearer <token>` header whose token value is malformed or invalid returns HTTP 401.
    - Verified by: `auth.test.ts` — "returns 401 for a malformed or invalid token" sends `Authorization: Bearer not-a-real-jwt` and asserts `res.status === 401`.

---

## Technical Constraints

17. The existing `src/benchmark-backend/src/middleware/auth.ts` file (`requireAuth`) is unchanged from the version in git at the time of the task start.
    - Verified by: `git diff HEAD -- src/benchmark-backend/src/middleware/auth.ts` produces no output.

18. `JWT_SECRET` is never hardcoded in any source file; it is always read from `process.env.JWT_SECRET`.
    - Verified by: `grep -r 'JWT_SECRET' src/benchmark-backend/src/ --include='*.ts'` shows only references to `process.env.JWT_SECRET`, never a string literal value.

19. All new auth routes are mounted at `/api/auth` in `src/benchmark-backend/src/app.ts` (i.e. `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` are reachable at those paths).
    - Verified by: the `auth.test.ts` supertest calls all use those exact paths and the full test suite passes with `pnpm test`.

20. The full visible test suite (`pnpm test` in `src/benchmark-backend`) passes with no test failures.
    - Verified by: `pnpm test` exit code is 0 and no test is reported as failed in the output.

---

## Edge Cases

- Missing `email` or `username` in register body → HTTP 400: covered by requirement 6–8 (Zod validation rejects missing required fields).
- Both `email` and `username` duplicate simultaneously → the first constraint hit (email checked first) returns 409 with the email error: covered by requirements 9 and 10.
- JWT with correct structure but signed with wrong secret → `requireJwt` rejects it, `GET /api/auth/me` returns 401: covered by requirement 16.
- `password` field in login response body: must be absent; covered by requirement 11.
- Rate-limiter middleware is mocked in `auth.test.ts` (see line 7) so the 429-bypass is not a new requirement but must not break the mock.
