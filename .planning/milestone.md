# Milestone

Task: task12
Target: backend

## Requirements addressed

- Requirement 1 (004_users.sql migration): verified — file present with all five required columns (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))).
- Requirement 2 (POST /api/auth/register returns 201): verified — auth.test.ts 'registers a new user and returns 201 with a user object and token' PASSED; 34 tests passed, 0 failed.
- Requirement 3 (password never in register response): verified — auth.test.ts 'never includes the password anywhere in the response body' PASSED.
- Requirement 4 (bcrypt hash stored): verified — auth.test.ts 'stores the password as a bcrypt hash, not plaintext' PASSED; row.password matches /^\$2[aby]?\$/.
- Requirement 5 (JWT carries userId, email, username claims): verified — auth.test.ts 'issues a JWT carrying userId, email, and username claims' PASSED.
- Requirement 6 (password < 8 chars returns 400): verified — auth.test.ts 'rejects a password shorter than 8 characters with 400' PASSED.
- Requirement 7 (missing password returns 400): verified — auth.test.ts 'rejects a missing password with 400' PASSED.
- Requirement 8 (malformed email returns 400): verified — auth.test.ts 'rejects an invalid email format with 400' PASSED.
- Requirement 9 (duplicate email returns 409): verified — auth.test.ts "returns 409 'Email already registered' for a duplicate email" PASSED; res.body.error === 'Email already registered'.
- Requirement 10 (duplicate username returns 409): verified — auth.test.ts "returns 409 'Username already taken' for a duplicate username" PASSED; res.body.error === 'Username already taken'.
- Requirement 11 (POST /api/auth/login returns 200): verified — auth.test.ts 'logs in with valid credentials and returns 200 with a user and token' PASSED; user.password absent.
- Requirement 12 (wrong password returns 401): verified — auth.test.ts "returns 401 'Invalid credentials' for a wrong password" PASSED.
- Requirement 13 (unknown email returns 401): verified — auth.test.ts "returns 401 'Invalid credentials' for an unknown email (same message as a wrong password)" PASSED.
- Requirement 14 (GET /api/auth/me valid token returns 200): verified — auth.test.ts 'returns the user object for a valid token, without the password field' PASSED.
- Requirement 15 (GET /api/auth/me no header returns 401): verified — auth.test.ts 'returns 401 when no Authorization header is provided' PASSED.
- Requirement 16 (GET /api/auth/me invalid token returns 401): verified — auth.test.ts 'returns 401 for a malformed or invalid token' PASSED.
- Requirement 17 (requireAuth middleware unchanged): verified — git diff HEAD -- src/benchmark-backend/src/middleware/auth.ts produced no output.
- Requirement 18 (JWT_SECRET not hardcoded): verified — grep shows only process.env['JWT_SECRET'] references in src/utils/jwt.ts; no string literal values.
- Requirement 19 (routes mounted at /api/auth): verified — app.ts line 26: app.use('/api/auth', authRoutes); all three endpoints reachable at required paths.
- Requirement 20 (full test suite passes): verified — pnpm test: Test Files 2 passed (2), Tests 34 passed (34), Duration 1.00s; exit code 0.

## Files changed

- `src/benchmark-backend/src/db/migrations/004_users.sql`: New file — CREATE TABLE users DDL with id, email, username, password, created_at columns.
- `src/benchmark-backend/src/schemas/authSchema.ts`: New file — Zod schemas for register (email, username, password >= 8 chars) and login (email, password) request bodies.
- `src/benchmark-backend/src/services/authService.ts`: New file — register, login, getById business logic; bcrypt hashing; JWT signing via process.env.JWT_SECRET.
- `src/benchmark-backend/src/middleware/requireJwt.ts`: New file — Express middleware reading Authorization: Bearer token, verifying JWT, attaching decoded payload to req; returns 401 on failure.
- `src/benchmark-backend/src/controllers/authController.ts`: New file — HTTP handlers for register, login, me; parses body, calls service, sends response; password excluded from all responses.
- `src/benchmark-backend/src/routes/authRoutes.ts`: New file — Express router wiring POST /register, POST /login, GET /me to controllers via requireJwt middleware.
- `src/benchmark-backend/src/utils/jwt.ts`: New file — JWT sign/verify utilities reading JWT_SECRET from process.env.
- `src/benchmark-backend/src/errors/index.ts`: Modified — added ConflictError (409) for duplicate email/username cases.
- `src/benchmark-backend/src/app.ts`: Modified — mounts auth router at /api/auth.

## Checks

- pnpm test: 34 passed, 0 failed
- pnpm run build: pass
