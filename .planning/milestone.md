# Milestone

Task: task12
Target: backend

## Requirements addressed

- Req 1 (004_users.sql with exact DDL): verified — cat output matched exact spec DDL; "stores the password as a bcrypt hash" test queries the users table by email and passed.
- Req 2 (POST /api/auth/register returns 201 with user+token, no password): verified — auth.test.ts "registers a new user and returns 201 with a user object and token" passed.
- Req 3 (response body never includes plaintext password): verified — auth.test.ts "never includes the password anywhere in the response body" passed.
- Req 4 (password column contains bcrypt hash): verified — auth.test.ts "stores the password as a bcrypt hash, not plaintext" passed.
- Req 5 (token is valid JWT with userId, email, username claims): verified — auth.test.ts "issues a JWT carrying userId, email, and username claims" passed.
- Req 6 (password < 8 chars → 400): verified — auth.test.ts "rejects a password shorter than 8 characters with 400" passed.
- Req 7 (missing password → 400): verified — auth.test.ts "rejects a missing password with 400" passed.
- Req 8 (invalid email format → 400): verified — auth.test.ts "rejects an invalid email format with 400" passed.
- Req 9 (duplicate email → 409 "Email already registered"): verified — auth.test.ts "returns 409 \"Email already registered\" for a duplicate email" passed.
- Req 10 (duplicate username → 409 "Username already taken"): verified — auth.test.ts "returns 409 \"Username already taken\" for a duplicate username" passed.
- Req 11 (POST /api/auth/login returns 200 with user+token, no password): verified — auth.test.ts "logs in with valid credentials and returns 200 with a user and token" passed.
- Req 12 (wrong password → 401 "Invalid credentials"): verified — auth.test.ts "returns 401 \"Invalid credentials\" for a wrong password" passed.
- Req 13 (unknown email → 401 "Invalid credentials", same message): verified — auth.test.ts "returns 401 \"Invalid credentials\" for an unknown email (same message as a wrong password)" passed.
- Req 14 (GET /api/auth/me with valid token returns 200, no password): verified — auth.test.ts "returns the user object for a valid token, without the password field" passed.
- Req 15 (no Authorization header → 401): verified — auth.test.ts "returns 401 when no Authorization header is provided" passed.
- Req 16 (malformed/invalid token → 401): verified — auth.test.ts "returns 401 for a malformed or invalid token" passed.
- Req 17 (middleware/auth.ts not modified): verified — git diff src/benchmark-backend/src/middleware/auth.ts produced no output.
- Req 18 (JWT_SECRET from process.env): verified — authService.ts line 7: const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-key'; sign() calls pass the variable, not a string literal.
- Req 19 (routes mounted at /api/auth via authRoutes.ts): verified — app.ts contains import authRoutes and app.use('/api/auth', authRoutes); authRoutes.ts exists.
- Req 20 (Zod schemas in authSchema.ts): verified — authSchema.ts exports registerSchema and loginSchema; authRoutes.ts imports both.
- Req 21 (requireJwt.ts exists and used for /me): verified — requireJwt.ts exists; authRoutes.ts line 3 imports requireJwt; GET /me route uses it.
- Req 22 (full test suite exits 0, all tests pass): verified — pnpm test: Test Files 2 passed (2) / Tests 34 passed (34) / Duration 805ms. Exit code 0. pnpm run build also succeeded.

## Files changed

- `src/benchmark-backend/package.json`: Added bcrypt, jsonwebtoken, @types/bcrypt, @types/jsonwebtoken dependencies.
- `src/benchmark-backend/src/db/migrations/004_users.sql`: New file — CREATE TABLE users DDL with id, email, username, password, created_at columns.
- `src/benchmark-backend/src/schemas/authSchema.ts`: New file — Zod registerSchema and loginSchema for request validation.
- `src/benchmark-backend/src/types/express.d.ts`: Modified — augmented Express.Request with user?: { userId, email, username } for requireJwt.
- `src/benchmark-backend/src/services/authService.ts`: New file — register, login, getById with bcrypt hashing, JWT signing, duplicate constraint handling.
- `src/benchmark-backend/src/middleware/requireJwt.ts`: New file — JWT verification middleware, attaches decoded payload to req.user.
- `src/benchmark-backend/src/controllers/authController.ts`: New file — HTTP handlers for register (201), login (200), me (200); delegates to authService.
- `src/benchmark-backend/src/routes/authRoutes.ts`: New file — Express router wiring POST /, POST /login, GET /me with validate and requireJwt middleware.
- `src/benchmark-backend/src/app.ts`: Modified — imports and mounts authRoutes at /api/auth.

## Checks

- pnpm test: 34 passed, 0 failed (auth.test.ts: 15 tests, products.test.ts: 19 tests)
- pnpm run build: pass (tsc -p tsconfig.build.json, zero errors)
