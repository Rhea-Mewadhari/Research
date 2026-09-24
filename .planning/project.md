# Project

Task: task13
Target: backend

## Idea

Task 13 extends the authentication foundation from Task 12 to add user profile management on the backend. The main deliverable is a new `PATCH /api/users/me` endpoint that lets an authenticated user update their own username, email, and/or password. The endpoint must: (1) require a valid JWT via `requireJwt` middleware; (2) validate the request body with a Zod schema; (3) enforce that `currentPassword` is provided and correct whenever `newPassword` is supplied; (4) check that a changed email or username is not already taken (returning 409 if so); (5) perform all field updates as a single atomic operation — if any validation fails, nothing is written; (6) hash new passwords with bcrypt before storing; and (7) never return the `password` field. Additionally, `GET /api/auth/me` must be verified to resolve the user from the JWT-decoded `req.jwtUser.userId`, ignoring any `id`/`userId` query params — the current implementation already does this correctly.

## Spec pointers

- `src/benchmark-backend/instructions/task13.md`: Full spec — backend Part 1 covers endpoint contract, rules, technical constraints, and files to create/modify.
- `src/benchmark-backend/src/tests/visible/userProfile.test.ts`: Visible tests covering ownership guard on GET /api/auth/me, PATCH /api/users/me (auth required, username update, empty body 400, missing currentPassword 400, wrong currentPassword 400, password change + subsequent login, bcrypt hash verification, email conflict 409 with no partial writes, username conflict 409).

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/schemas/userSchema.ts`: Does not exist; must be created with a Zod schema for the PATCH body (username, email, currentPassword, newPassword — all optional, at least one recognised field required).
- `src/benchmark-backend/src/services/userService.ts`: Does not exist; must be created with an `updateUser` function implementing atomic update logic, bcrypt hashing, and uniqueness validation.
- `src/benchmark-backend/src/controllers/authController.ts`: Exists; `me` function already uses `req.jwtUser!.userId` — likely correct, but confirm against ownership test.
- `src/benchmark-backend/src/routes/userRoutes.ts`: Does not exist; must be created mounting `PATCH /me` with `requireJwt` and the userSchema validation.
- `src/benchmark-backend/src/app.ts`: Exists; must mount the new user routes at `/api/users`.
- `src/benchmark-backend/src/errors/index.ts`: Exists; `ConflictError` (409) and `ValidationError` (400) are already defined and can be reused.
- `src/benchmark-backend/src/middleware/requireJwt.ts`: Exists; must not be modified — used as-is to guard the PATCH endpoint.
- `src/benchmark-backend/src/db/client.ts`: Exists; direct SQLite db access used by authService for user lookups/inserts — userService will use the same pattern.
