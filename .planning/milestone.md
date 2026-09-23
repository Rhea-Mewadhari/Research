# Milestone

Task: task12
Target: backend

## Requirements addressed

- Req 1 — 004_users.sql migration with CREATE TABLE users: verified — file exists at src/benchmark-backend/src/db/migrations/004_users.sql; in-memory migration applied on each test run; pnpm test: 34 passed (34).
- Req 2 — POST /api/auth/register returns 201 with { user: { id, email, username, createdAt }, token }: verified — test 'registers a new user and returns 201 with a user object and token' passes; 34 passed (34).
- Req 3 — password absent from register response body: verified — test 'never includes the password anywhere in the response body' passes; 34 passed (34).
- Req 4 — password stored as bcrypt hash (starts with $2a$/$2b$/$2y$): verified — test 'stores the password as a bcrypt hash, not plaintext' passes; authService.ts uses bcrypt.hashSync(password, 10); 34 passed (34).
- Req 5 — JWT payload contains userId, email, username matching register input: verified — test 'issues a JWT carrying userId, email, and username claims' passes; 34 passed (34).
- Req 6 — password shorter than 8 chars returns 400: verified — test 'rejects a password shorter than 8 characters with 400' passes; 34 passed (34).
- Req 7 — missing password field returns 400: verified — test 'rejects a missing password with 400' passes; 34 passed (34).
- Req 8 — invalid email format returns 400: verified — test 'rejects an invalid email format with 400' passes; 34 passed (34).
- Req 9 — duplicate email returns 409 with { error: 'Email already registered' }: verified — test 'returns 409 "Email already registered" for a duplicate email' passes; 34 passed (34).
- Req 10 — duplicate username returns 409 with { error: 'Username already taken' }: verified — test 'returns 409 "Username already taken" for a duplicate username' passes; 34 passed (34).
- Req 11 — POST /api/auth/login with valid credentials returns 200 with { user, token }, password absent: verified — test 'logs in with valid credentials and returns 200 with a user and token' passes; 34 passed (34).
- Req 12 — wrong password returns 401 with { error: 'Invalid credentials' }: verified — test 'returns 401 "Invalid credentials" for a wrong password' passes; 34 passed (34).
- Req 13 — unknown email returns 401 with { error: 'Invalid credentials' } (same message): verified — test 'returns 401 "Invalid credentials" for an unknown email' passes; 34 passed (34).
- Req 14 — GET /api/auth/me with valid JWT returns 200 with user, password absent: verified — test 'returns the user object for a valid token, without the password field' passes; 34 passed (34).
- Req 15 — GET /api/auth/me with no Authorization header returns 401: verified — test 'returns 401 when no Authorization header is provided' passes; 34 passed (34).
- Req 16 — GET /api/auth/me with malformed/invalid JWT returns 401: verified — test 'returns 401 for a malformed or invalid token' passes; 34 passed (34).
- Req 17 — requireJwt middleware at src/middleware/requireJwt.ts; auth.ts unmodified: verified — file exists; git diff shows auth.ts unchanged; /me tests pass; 34 passed (34).
- Req 18 — app.ts mounts auth router at /api/auth; errorHandler still last middleware: verified — app.ts line 26 mounts authRoutes; errorHandler is final middleware; all auth tests pass; 34 passed (34).
- Req 19 — JWT signed with process.env.JWT_SECRET, expiresIn '24h', no hardcoded secret: verified — authService.ts uses process.env['JWT_SECRET']; grep finds only env-var references; 34 passed (34).
- Req 20 — express.d.ts declares req.user with userId/email/username; pnpm tsc --noEmit exits 0: verified — express.d.ts line 6 adds user type; tsc --noEmit exits 0; 34 passed (34).
- Req 21 — no existing test file modified: verified — git diff --name-only shows no files under src/benchmark-backend/src/tests/; 34 passed (34).
- Req 22 — all visible auth tests pass; pnpm test exits 0: verified — 34 passed (34) across 2 test files on 3 consecutive runs.

## Files changed

- `src/benchmark-backend/package.json`: added bcrypt, @types/bcrypt, jsonwebtoken, @types/jsonwebtoken dependencies
- `src/benchmark-backend/src/db/migrations/004_users.sql`: new file; CREATE TABLE IF NOT EXISTS users with id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))
- `src/benchmark-backend/src/errors/index.ts`: added ConflictError class extending AppError with statusCode 409 and code 'CONFLICT_ERROR'
- `src/benchmark-backend/src/schemas/authSchema.ts`: new file; registerSchema (email, username, password min 8) and loginSchema (email, password) Zod schemas
- `src/benchmark-backend/src/services/authService.ts`: new file; register, login, getById functions; bcrypt hashing; JWT signing with process.env.JWT_SECRET and expiresIn '24h'; ConflictError for duplicates; AuthError for bad credentials
- `src/benchmark-backend/src/types/express.d.ts`: extended Request interface with user: { userId: string; email: string; username: string }
- `src/benchmark-backend/src/middleware/requireJwt.ts`: new file; reads Authorization: Bearer header; verifies JWT with process.env.JWT_SECRET; attaches req.user; returns 401 on failure
- `src/benchmark-backend/src/controllers/authController.ts`: new file; registerUser (201), loginUser (200), getMe (200) handlers; Zod validation; delegates to authService; errors flow to errorHandler via next(err)
- `src/benchmark-backend/src/routes/authRoutes.ts`: new file; Express Router with POST /register, POST /login, GET /me (with requireJwt)
- `src/benchmark-backend/src/app.ts`: modified; mounts authRoutes at /api/auth; errorHandler remains last middleware

## Checks

- pnpm test: 34 passed, 0 failed (2 test files: auth.test.ts, products.test.ts)
- pnpm run build: pass (pnpm tsc --noEmit exits with code 0)
