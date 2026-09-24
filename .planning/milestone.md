# Milestone

Task: task12
Target: backend

## Requirements addressed

- Req 1 — Migration 004_users.sql creates users table with correct schema: verified — file exists with CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))
- Req 2 — Migration picked up automatically by runMigrations(): verified — 34 tests passed across 2 files with no manual migration setup
- Req 3 — POST /api/auth/register mounted and reachable: verified — auth.test.ts line 26 received HTTP 201
- Req 4 — Valid registration returns HTTP 201 with { user: { id, email, username, createdAt }, token }: verified — all field assertions passed (34/34)
- Req 5 — password absent from registration response: verified — res.body.user.password toBeUndefined and JSON.stringify not containing plaintext both passed
- Req 6 — Password stored as bcrypt hash ($2a$/$2b$/$2y$): verified — direct DB query confirmed hash format, plaintext not stored
- Req 7 — JWT is three-segment; payload contains userId, email, username: verified — token.split('.').length === 3 and all payload claims matched
- Req 8 — Password < 8 chars returns HTTP 400: verified — 'short1' → 400
- Req 9 — Missing password returns HTTP 400: verified — body {email, username} → 400
- Req 10 — Malformed email returns HTTP 400: verified — 'not-an-email' → 400
- Req 11 — Duplicate email returns HTTP 409 with 'Email already registered': verified — exact error message matched
- Req 12 — Duplicate username returns HTTP 409 with 'Username already taken': verified — exact error message matched
- Req 13 — POST /api/auth/login mounted and reachable: verified — received HTTP 200
- Req 14 — Valid login returns HTTP 200 with user object (no password) and token: verified — all assertions passed
- Req 15 — Wrong password returns HTTP 401 with 'Invalid credentials': verified — exact message matched
- Req 16 — Unknown email returns HTTP 401 with 'Invalid credentials' (no leakage): verified — exact message matched
- Req 17 — GET /api/auth/me mounted and reachable: verified — received HTTP 200
- Req 18 — Valid Bearer JWT on /me returns HTTP 200 with user object (no password): verified — all assertions passed
- Req 19 — No Authorization header on /me returns HTTP 401: verified — res.status === 401
- Req 20 — Malformed/invalid token on /me returns HTTP 401: verified — 'Bearer not-a-real-jwt' → 401
- Req 21 — requireJwt.ts verifies Bearer token via JWT_SECRET, attaches payload, returns 401 on failure: verified — file exists, jwt.verify uses process.env.JWT_SECRET, requirements 18–20 all pass
- Req 22 — Existing auth.ts (requireAuth) not modified: verified — git diff shows zero changes; existing product tests still pass
- Req 23 — authSchema.ts exports registerSchema and loginSchema; tsc --noEmit exits 0: verified — file exists, TypeScript compiles clean
- Req 24 — JWT_SECRET from process.env only, not hardcoded: verified — grep found only two process.env.JWT_SECRET references, no hardcoded string
- Req 25 — JWT signed with expiresIn '24h': verified — authService.ts confirmed; payload exp tests pass
- Req 26 — app.ts imports and mounts authRoutes at /api/auth before 404 handler: verified — grep confirmed import and mount; all three endpoints reachable
- Req 27 — All six new files created: verified — ls of all 6 paths succeeded
- Req 28 — pnpm test exits 0: verified — Test Files 2 passed (2), Tests 34 passed (34), 0 failures

## Files changed

- src/benchmark-backend/package.json: added jsonwebtoken, bcryptjs, @types/jsonwebtoken, @types/bcryptjs dependencies
- src/benchmark-backend/src/db/migrations/004_users.sql: new migration creating users table
- src/benchmark-backend/src/schemas/authSchema.ts: new Zod schemas — registerSchema and loginSchema
- src/benchmark-backend/src/types/express.d.ts: extended Express.Request with user: { userId, email, username } for JWT payload
- src/benchmark-backend/src/middleware/requireJwt.ts: new JWT verification middleware returning 401 on missing/invalid token
- src/benchmark-backend/src/services/authService.ts: new service — registerUser (bcrypt hash, insert, sign JWT), loginUser (verify, sign JWT), getUserById
- src/benchmark-backend/src/controllers/authController.ts: new controller — register, login, me handlers; no password in any response
- src/benchmark-backend/src/routes/authRoutes.ts: new router mounting POST /register, POST /login, GET /me (with requireJwt)
- src/benchmark-backend/src/app.ts: imported and mounted authRoutes at /api/auth

## Checks

- pnpm test: 34 passed, 0 failed (2 test files: auth.test.ts and existing suite)
- pnpm run build: pass (tsc --noEmit exits 0 with no type errors)
