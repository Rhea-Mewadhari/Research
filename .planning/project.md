# Project

Task: task12
Target: backend

## Idea

Implement the backend half of a full-stack authentication system. A `users` table must be added via a new SQL migration. Three endpoints are required: `POST /api/auth/register` creates a new user (hashing the password with bcrypt, returning a signed JWT), `POST /api/auth/login` authenticates an existing user (returning a fresh JWT), and `GET /api/auth/me` identifies the caller by validating the JWT via a new `requireJwt` middleware. Input validation uses the existing Zod schema pattern. Passwords are never returned in any response. The existing `requireAuth` benchmark middleware must not be modified.

## Spec pointers

- `src/benchmark-backend/instructions/task12.md`: Full task spec for both backend and frontend. Part 1 (lines 19–97) defines all backend requirements — migration DDL, endpoint contracts, validation rules, JWT signing details, middleware shape, and file list.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/db/migrations/004_users.sql`: New file — DDL for the `users` table (id TEXT PK, email UNIQUE, username UNIQUE, password, created_at)
- `src/benchmark-backend/src/schemas/authSchema.ts`: New file — Zod schemas for register (email, username, password) and login (email, password) request bodies
- `src/benchmark-backend/src/services/authService.ts`: New file — `register`, `login`, `getById` business logic; bcrypt hashing; JWT signing; no `req`/`res` access
- `src/benchmark-backend/src/middleware/requireJwt.ts`: New file — Express middleware that reads `Authorization: Bearer <token>`, verifies with `jsonwebtoken`, attaches decoded payload to `req`; returns 401 on failure
- `src/benchmark-backend/src/controllers/authController.ts`: New file — HTTP handlers for register, login, me; parses request, calls service, sends response
- `src/benchmark-backend/src/routes/authRoutes.ts`: New file — Express router wiring `POST /register`, `POST /login`, `GET /me` to controllers
- `src/benchmark-backend/src/app.ts`: Existing file — mount auth router at `/api/auth`
- `src/benchmark-backend/src/errors/index.ts`: Existing file — `ValidationError`, `AuthError`, `AppError` already defined; may need a `ConflictError` (409) for duplicate email/username
- `src/benchmark-backend/src/db/client.ts`: Existing file — SQLite client used by services; examine before writing DB queries
- `src/benchmark-backend/src/tests/visible/auth.test.ts`: Existing visible test file — must not be modified; defines what the endpoints must satisfy
