# Project

Task: task12
Target: backend

## Idea

Implement the backend authentication foundation: add a `users` table via a new SQL migration, expose three endpoints (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`), hash passwords with bcrypt before storage, sign and verify JWTs with `jsonwebtoken` using `process.env.JWT_SECRET` (24-hour expiry), validate all inputs with Zod schemas, and wire everything through the existing Express layer pattern (routes → controllers → services). A new `requireJwt` middleware handles JWT verification for the `/me` route and is distinct from the existing `requireAuth` benchmark middleware. The password field must never appear in any API response.

## Spec pointers

- `benchmark-backend/instructions/task12.md`: Full spec for both targets. Part 1 (backend) covers the DB migration, all three endpoints, request/response shapes, validation rules, error codes (400/401/409), JWT requirements, and the exact list of files to create or modify.

## Affected areas (initial read, not final)

- `src/db/migrations/004_users.sql`: New file — SQL CREATE TABLE for `users` with `id`, `email`, `username`, `password`, `created_at`.
- `src/schemas/authSchema.ts`: New file — Zod schemas for register (email, username, password) and login (email, password) request bodies.
- `src/services/authService.ts`: New file — `register`, `login`, `getById` functions; bcrypt hashing; DB inserts/queries; duplicate email/username detection.
- `src/middleware/requireJwt.ts`: New file — Express middleware that reads `Authorization: Bearer <token>`, verifies JWT, attaches decoded user to `req`, and returns 401 on failure.
- `src/controllers/authController.ts`: New file — HTTP handlers `registerUser`, `loginUser`, `getMe` that delegate to authService and format responses.
- `src/routes/authRoutes.ts`: New file — Express Router mounting POST `/register`, POST `/login`, GET `/me` (with `requireJwt`).
- `src/app.ts`: Modified — mounts `authRoutes` at `/api/auth`.
- `src/db/client.ts`: Read-only reference — understand DB query pattern for the service layer.
- `src/middleware/auth.ts`: Read-only — existing `requireAuth`; must not be modified.
- `src/middleware/errorHandler.ts`: Read-only — all new endpoints must propagate errors through this.
- `src/errors/index.ts`: Read-only — `ValidationError` type reused for 400 responses.
- `src/types/express.d.ts`: Likely needs extending — `requireJwt` attaches a decoded user object to `req`.
- `src/tests/visible/auth.test.ts`: Read-only visible tests that the implementation must satisfy.
