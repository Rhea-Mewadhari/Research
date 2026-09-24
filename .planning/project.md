# Project

Task: task12
Target: backend

## Idea

Task 12 implements the authentication foundation for the platform. The backend portion (Part 1) requires creating a `users` table via a new SQLite migration, exposing three new endpoints (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`), hashing passwords with bcrypt, signing JWTs with `jsonwebtoken`, and protecting the `/me` route with a new `requireJwt` middleware that is distinct from the existing `requireAuth` benchmark middleware. All input validation must use Zod schemas following the existing pattern in `src/schemas/`.

Note: `jsonwebtoken` and `bcryptjs` (or `bcrypt`) are **not currently in package.json** — they will need to be installed.

## Spec pointers

- `src/benchmark-backend/instructions/task12.md`: Full spec; defines database schema, endpoint contracts, request/response shapes, validation rules, JWT claims, error codes, and the list of files to create or modify.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/db/migrations/004_users.sql`: Must be created — defines the `users` table (id TEXT PK, email TEXT UNIQUE, username TEXT UNIQUE, password TEXT, created_at TEXT).
- `src/benchmark-backend/src/schemas/authSchema.ts`: Must be created — Zod schemas for `registerSchema` (email, username, password ≥8 chars) and `loginSchema` (email, password).
- `src/benchmark-backend/src/services/authService.ts`: Must be created — `register`, `login`, `getById` business logic; bcrypt hashing; uuid generation; DB queries.
- `src/benchmark-backend/src/middleware/requireJwt.ts`: Must be created — JWT verification middleware attaching decoded user to `req`; returns 401 on missing/invalid/expired token.
- `src/benchmark-backend/src/controllers/authController.ts`: Must be created — HTTP handlers for `register`, `login`, `me`; delegates to `authService`; strips `password` from responses.
- `src/benchmark-backend/src/routes/authRoutes.ts`: Must be created — mounts controller functions at `/register`, `/login`, `/me`.
- `src/benchmark-backend/src/app.ts`: Must be modified — imports and mounts `authRoutes` at `/api/auth`.
- `src/benchmark-backend/src/types/express.d.ts`: Likely needs extending — to add `jwtUser` or similar field populated by `requireJwt`.
- `src/benchmark-backend/package.json`: Must be updated — add `jsonwebtoken`, `bcryptjs` (or `bcrypt`) as runtime deps; add their `@types/*` as dev deps.
- `src/benchmark-backend/src/db/migrate.ts`: May need review — to ensure `004_users.sql` is picked up automatically.
- `src/benchmark-backend/src/errors/index.ts`: Existing `AuthError` (401) and `ValidationError` (400) are available for reuse; a new conflict error (409) may be needed or handled inline.
