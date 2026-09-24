# Project

Task: task13
Target: backend

## Idea

Task 13 (backend portion) extends the existing Task 12 authentication foundation with a user profile management endpoint. The core addition is `PATCH /api/users/me`, a protected route that allows the authenticated user to update their own username, email, and/or password atomically. The update must be fully atomic (no partial writes if validation fails), must hash new passwords with bcrypt, must check for uniqueness conflicts on email/username, and must never return the password field. Additionally, `GET /api/auth/me` must be verified to resolve the user strictly from the JWT payload (`req.user.userId`), not from any URL-supplied parameter.

## Spec pointers

- `src/benchmark-backend/instructions/task13.md`: Full task specification — backend endpoint rules, request/response shapes, validation requirements, atomicity constraint, files to create/modify, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/schemas/userSchema.ts`: New file — Zod schema for PATCH /api/users/me request body (username, email, currentPassword, newPassword all optional, at least one required)
- `src/benchmark-backend/src/services/userService.ts`: New file — `updateUser` service with atomic update logic, bcrypt hashing, and uniqueness checks
- `src/benchmark-backend/src/controllers/authController.ts`: Verify/fix `me` controller to use `req.user.userId` only, never URL params; add `patchMe` controller for the PATCH endpoint
- `src/benchmark-backend/src/routes/userRoutes.ts`: New file — `PATCH /api/users/me` route wired to `requireJwt` and the patch controller
- `src/benchmark-backend/src/app.ts`: Mount the new user routes at `/api/users`
- `src/benchmark-backend/src/services/authService.ts`: Reference only — provides `UserRow`, `UserResult`, and `getUserById` patterns to follow
- `src/benchmark-backend/src/middleware/requireJwt.ts`: Reference only — must not be modified; used to guard the new route
- `src/benchmark-backend/src/tests/visible/userProfile.test.ts`: Visible test file — defines the exact behaviours that must pass (ownership check, 200/400/409 cases, atomicity, bcrypt storage)
