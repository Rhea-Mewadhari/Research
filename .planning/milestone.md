# Milestone

Task: task12
Target: backend

## Requirements addressed
- Req 1 — 004_users.sql exists with correct CREATE TABLE statement: verified — migration applied automatically; test 'stores the password as a bcrypt hash, not plaintext' queries `SELECT password FROM users` and passed without "no such table" error.
- Req 2 — jsonwebtoken and bcryptjs in dependencies; @types/* in devDependencies: verified — package.json confirms bcryptjs ^3.0.3, jsonwebtoken ^9.0.3; @types/bcryptjs ^3.0.0, @types/jsonwebtoken ^9.0.10; all 34 tests passed with no import errors.
- Req 3 — authSchema.ts exports registerSchema and loginSchema: verified — file present with z.string().email(), z.string().min(1), z.string().min(8); tsc --noEmit passed; validation tests (reqs 7-9) all PASSED.
- Req 4 — POST /api/auth/register returns 201 with { user: { id, email, username, createdAt }, token }; no password in body: verified — auth.test.ts 'registers a new user and returns 201 with a user object and token' PASSED; 'never includes the password anywhere in the response body' PASSED.
- Req 5 — Password stored as bcrypt hash /^\$2[aby]?\$/: verified — auth.test.ts 'stores the password as a bcrypt hash, not plaintext' PASSED; reads password column directly from DB.
- Req 6 — Token from register is three-segment JWT with { userId, email, username } payload: verified — auth.test.ts 'issues a JWT carrying userId, email, and username claims' PASSED.
- Req 7 — POST /api/auth/register returns 400 for short password, missing password, invalid email: verified — three rejection tests all PASSED (1ms each; Zod validation).
- Req 8 — Duplicate email returns 409 with exact message "Email already registered": verified — auth.test.ts 'returns 409 "Email already registered" for a duplicate email' PASSED; ConflictError flows through errorHandler.
- Req 9 — Duplicate username returns 409 with exact message "Username already taken": verified — auth.test.ts 'returns 409 "Username already taken" for a duplicate username' PASSED.
- Req 10 — POST /api/auth/login returns 200 with { user, token }; no password in body: verified — auth.test.ts 'logs in with valid credentials and returns 200 with a user and token' PASSED.
- Req 11 — Wrong password returns 401 with "Invalid credentials": verified — auth.test.ts 'returns 401 "Invalid credentials" for a wrong password' PASSED.
- Req 12 — Unknown email returns 401 with "Invalid credentials" (no user enumeration): verified — auth.test.ts 'returns 401 "Invalid credentials" for an unknown email (same message as a wrong password)' PASSED.
- Req 13 — GET /api/auth/me with valid Bearer token returns 200 with user object; no password: verified — auth.test.ts 'returns the user object for a valid token, without the password field' PASSED.
- Req 14 — GET /api/auth/me with no Authorization header returns 401: verified — auth.test.ts 'returns 401 when no Authorization header is provided' PASSED.
- Req 15 — GET /api/auth/me with invalid token returns 401: verified — auth.test.ts 'returns 401 for a malformed or invalid token' PASSED.
- Req 16 — requireJwt.ts reads secret from process.env.JWT_SECRET only; no hardcoded secret; attaches jwtUser and calls next() on valid token; returns 401 without calling next() on failure: verified — only reference is `jwt.verify(token, process.env.JWT_SECRET as string)`; tests 14 and 15 PASSED.
- Req 17 — src/benchmark-backend/src/middleware/auth.ts not modified: verified — git diff produced no output.
- Req 18 — authRoutes.ts registers POST /register, POST /login, GET /me (with requireJwt): verified — file present; router.post('/register', ...), router.post('/login', ...), router.get('/me', requireJwt, me); all endpoints returned expected HTTP statuses (not 404).
- Req 19 — app.ts mounts auth router at /api/auth before 404 fallback: verified — app.ts line 6 imports authRoutes, line 26 mounts at '/api/auth' before the 404 handler; all auth tests passed (not 404).
- Req 20 — All auth errors flow through existing errorHandler; errorHandler.ts not modified: verified — git diff on errorHandler.ts produced no output; ConflictError (409) and AuthError (401) thrown as AppError subclasses and handled correctly.
- Req 21 — Password never appears in any response body: verified — auth.test.ts 'never includes the password anywhere in the response body' PASSED; login and /me tests also assert password undefined.
- Req 22 — express.d.ts declares jwtUser field on Express Request: verified — file declares `jwtUser?: { userId: string; email: string; username: string }`; tsc --noEmit produced zero errors.
- Req 23 — pnpm test exits 0; all 34 tests in auth.test.ts and products.test.ts green: verified — "Test Files 2 passed (2); Tests 34 passed (34)" — exit code 0.

## Files changed
- `src/benchmark-backend/src/db/migrations/004_users.sql`: Created — defines users table (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))).
- `src/benchmark-backend/src/schemas/authSchema.ts`: Created — exports registerSchema (email, username min 1, password min 8) and loginSchema (email, password) using Zod.
- `src/benchmark-backend/src/services/authService.ts`: Created — register (bcrypt hash, crypto.randomUUID, DB insert, JWT sign), login (bcrypt compare, JWT sign), getById (DB select); maps created_at → createdAt; strips password from all returned objects.
- `src/benchmark-backend/src/middleware/requireJwt.ts`: Created — extracts Bearer token, verifies with process.env.JWT_SECRET, attaches decoded payload to req.jwtUser and calls next() on success; responds 401 without next() on failure.
- `src/benchmark-backend/src/controllers/authController.ts`: Created — register (201, handles UNIQUE constraint → ConflictError), login (200, AuthError propagates), me (200, user object directly); password stripped from all responses.
- `src/benchmark-backend/src/routes/authRoutes.ts`: Created — POST /register (validate + register), POST /login (validate + login), GET /me (requireJwt + me).
- `src/benchmark-backend/src/app.ts`: Modified — imports authRoutes and mounts at /api/auth before the 404 fallback handler.
- `src/benchmark-backend/src/types/express.d.ts`: Modified — added jwtUser?: { userId: string; email: string; username: string } to Express.Request interface.
- `src/benchmark-backend/src/errors/index.ts`: Modified — added ConflictError class (HTTP 409, code 'CONFLICT') for duplicate email/username handling.
- `src/benchmark-backend/package.json`: Modified — added bcryptjs ^3.0.3 and jsonwebtoken ^9.0.3 to dependencies; @types/bcryptjs ^3.0.0 and @types/jsonwebtoken ^9.0.10 to devDependencies.

## Checks
- pnpm test: 34 passed, 0 failed (2 test files: auth.test.ts 15 tests + products.test.ts 19 tests)
- pnpm run build: pass
