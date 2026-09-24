# Project

Task: task12
Target: backend

## Idea

Implement the authentication foundation for the backend API. This involves creating a `users` table via a new SQL migration, exposing three new endpoints (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`), and wiring up all the supporting layers: Zod validation schemas, an auth service (register/login/getById), a `requireJwt` middleware for JWT verification, an auth controller, and an auth router mounted at `/api/auth` in `app.ts`. Passwords must be stored as bcrypt hashes and never returned in responses. JWTs are signed with `process.env.JWT_SECRET` and expire in 24 hours. The existing `requireAuth` benchmark middleware must not be modified.

## Spec pointers

- `benchmark-backend/instructions/task12.md`: Full task spec — database migration, all three endpoint contracts (request/response shapes, status codes, error messages), backend technical constraints, and list of files to create/modify.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/db/migrations/004_users.sql`: New migration file defining the `users` table schema.
- `src/benchmark-backend/src/schemas/authSchema.ts`: New file — Zod schemas for register and login request bodies.
- `src/benchmark-backend/src/services/authService.ts`: New file — register, login, getById business logic (bcrypt, JWT signing, DB queries).
- `src/benchmark-backend/src/middleware/requireJwt.ts`: New file — JWT verification middleware that attaches decoded user to `req`; distinct from existing `requireAuth`.
- `src/benchmark-backend/src/controllers/authController.ts`: New file — HTTP handlers for register, login, me; delegates to authService.
- `src/benchmark-backend/src/routes/authRoutes.ts`: New file — Express router wiring the three auth endpoints.
- `src/benchmark-backend/src/app.ts`: Modify — mount auth routes at `/api/auth`.
- `src/benchmark-backend/src/middleware/auth.ts`: Read-only — must not be modified.
- `src/benchmark-backend/src/errors/index.ts`: Read existing `ValidationError` type to reuse in validation failures.
- `src/benchmark-backend/src/middleware/validate.ts`: Read existing validate middleware pattern to reuse for schema validation.
- `src/benchmark-backend/src/db/client.ts`: Read existing DB client to understand how to query the database.
- `src/benchmark-backend/src/types/express.d.ts`: Likely needs augmentation to add `user` property to `Request` for `requireJwt`.
