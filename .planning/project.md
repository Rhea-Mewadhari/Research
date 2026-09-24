# Project

Task: task12
Target: backend

## Idea

Implement an authentication foundation for the backend API. This involves adding a `users` table via a SQL migration (`004_users.sql`), then building three endpoints (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`) that respectively create users with bcrypt-hashed passwords and return a JWT, authenticate users and return a fresh JWT, and return the current user's profile from a Bearer token. A new `requireJwt` middleware handles JWT verification. All validation uses the existing Zod schema pattern (mirroring `src/schemas/favouriteSchema.ts`). The existing `requireAuth` benchmark middleware must not be touched. Duplicate email/username return 409; invalid credentials return 401; the password field must never appear in any API response.

## Spec pointers

- `src/benchmark-backend/instructions/task12.md` (Part 1 — Backend): Full specification covering the database migration DDL, all three endpoint request/response contracts, error codes and messages, `requireJwt` middleware design, Zod schema requirements, JWT payload shape (`{ userId, email, username }`), bcrypt hashing requirement, and the complete list of files to create or modify.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/db/migrations/004_users.sql` — new migration creating `users` table (id TEXT PK, email TEXT UNIQUE, username TEXT UNIQUE, password TEXT, created_at TEXT)
- `src/benchmark-backend/src/schemas/authSchema.ts` — new Zod schemas: `registerSchema` (email, username, password ≥8 chars) and `loginSchema` (email, password)
- `src/benchmark-backend/src/services/authService.ts` — new service: `registerUser` (hash password, insert, return user+token), `loginUser` (verify password, return user+token), `getUserById` (lookup for /me)
- `src/benchmark-backend/src/middleware/requireJwt.ts` — new middleware: extracts Bearer token, verifies with `JWT_SECRET`, attaches decoded payload to `req`; returns 401 on missing/invalid/expired
- `src/benchmark-backend/src/controllers/authController.ts` — new controller: `register`, `login`, `me` handlers; parses request, calls service, sends response; never exposes password field
- `src/benchmark-backend/src/routes/authRoutes.ts` — new router mounting POST /register, POST /login, GET /me (with requireJwt)
- `src/benchmark-backend/src/app.ts` — modified to import and mount `authRoutes` at `/api/auth`
- `src/benchmark-backend/src/db/client.ts` — read-only reference; verify how migrations are loaded (the new migration must be picked up automatically)
- `src/benchmark-backend/src/errors/index.ts` — read-only reference; `ValidationError`, `AuthError`, `AppError` exist and will be reused
- `src/benchmark-backend/src/tests/visible/auth.test.ts` — read-only visible test; defines expected behaviour for all three endpoints including bcrypt hash check and JWT payload claims
