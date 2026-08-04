# Task 12: Feature — Authentication Foundation (Full-Stack)

## Objective

Implement user registration and login across **both** the backend API (`src/benchmark-backend`) and the frontend UI (`src/benchmark-frontend`). The backend must expose endpoints for creating and authenticating users. The frontend must provide signup and login forms, persist the returned token, and attach it to all subsequent API requests.

This is a single task that spans two repos. Work through the backend section first (the frontend depends on its contract), then the frontend section. All paths below are relative to the repo named in the section heading.

---

## Context

The platform currently has no user accounts. A `users` table does not exist in the database. The backend has no registration or login endpoints. The frontend has no auth UI and no concept of a logged-in session.

You are implementing the foundation layer of a full authentication system. Profile management will be handled separately. Your focus here is: a user can register, log in, and the system can identify who they are on subsequent requests.

---

## Part 1 — Backend (`src/benchmark-backend`)

### Database

Add a `users` table via a new migration file `src/db/migrations/004_users.sql`:

```sql
CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  username   TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Passwords must be stored as bcrypt hashes — never plaintext.

### POST /api/auth/register

Request body:
```json
{ "email": "user@example.com", "username": "jane_doe", "password": "plaintext-password" }
```

Response `201`:
```json
{
  "user": { "id": "uuid-v4", "email": "user@example.com", "username": "jane_doe", "createdAt": "2024-01-01T00:00:00.000Z" },
  "token": "jwt-token-string"
}
```

- Validate `email`, `username`, `password` are present and non-empty
- Validate email format
- Validate password minimum length of 8 characters
- Duplicate email → `409 { "error": "Email already registered" }`
- Duplicate username → `409 { "error": "Username already taken" }`
- Validation failure → `400`, via the existing `ValidationError` type
- Password must be hashed with bcrypt before storing
- Return a signed JWT containing `{ userId, email, username }` — use `jsonwebtoken`, secret from `process.env.JWT_SECRET`, expiry 24 hours

### POST /api/auth/login

Request body:
```json
{ "email": "user@example.com", "password": "plaintext-password" }
```

Response `200`: same `user` + `token` shape as register.

- Email not found or password mismatch → `401 { "error": "Invalid credentials" }` — do not distinguish the two cases in the error message
- On success, return a fresh JWT

### GET /api/auth/me

- Requires `Authorization: Bearer <jwt-token>`
- Validates and decodes the JWT using a new `requireJwt` middleware (`src/middleware/requireJwt.ts`) — this is distinct from the existing `requireAuth` benchmark middleware; do not modify `requireAuth`
- Returns `200` with the user object (no `password` field)
- Returns `401` if the token is missing, invalid, or expired

### Backend technical constraints

- Do not modify `src/middleware/auth.ts` or any existing auth logic
- All new endpoints must pass through the existing `errorHandler` middleware
- All request validation must use the existing Zod schema pattern in `src/schemas/`
- `JWT_SECRET` must be read from `process.env.JWT_SECRET` — do not hardcode it
- The `password` field must never appear in any API response

### Backend files to create or modify

- `src/db/migrations/004_users.sql` — new migration
- `src/schemas/authSchema.ts` — Zod schemas for register and login
- `src/services/authService.ts` — register, login, getById logic
- `src/middleware/requireJwt.ts` — JWT verification middleware
- `src/controllers/authController.ts` — register, login, me handlers
- `src/routes/authRoutes.ts` — route registration
- `src/app.ts` — mount auth routes at `/api/auth`

---

## Part 2 — Frontend (`src/benchmark-frontend`)

Build against the contract above:

- `POST /api/auth/register` → `201 { user: { id, email, username, createdAt }, token }`
- `POST /api/auth/login` → `200` same shape, or `401 { error: "Invalid credentials" }`
- `GET /api/auth/me` → `Authorization: Bearer <token>` → `200` user object, or `401`

### New pages

**`/signup`** (`src/pages/SignupPage.tsx`)

Fields: email (required), username (required, min 3 chars), password (required, min 8 chars), confirm password (must match).

Behaviour:
- On submit: `POST /api/auth/register`
- On success: store the token in `localStorage` under key `auth_token`, store the user object under key `auth_user`, redirect to `/`
- On `409`: display the server error message inline below the relevant field
- On `400`: display field-level errors inline
- Confirm-password mismatch must be caught client-side before the request is made
- Show a loading state on the submit button while the request is in flight

**`/login`** (`src/pages/LoginPage.tsx`)

Fields: email (required), password (required).

Behaviour:
- On submit: `POST /api/auth/login`
- On success: store token + user in `localStorage`, redirect to `/`
- On `401`: display `"Invalid email or password"` inline — do not surface the raw server message
- Show a loading state on the submit button while the request is in flight

### Auth state — `src/context/AuthContext.tsx`

State:
- `user: User | null`
- `token: string | null`
- `isAuthenticated: boolean`

Actions:
- `login(email, password): Promise<void>`
- `register(email, username, password): Promise<void>`
- `logout(): void`

Behaviour:
- Hydrated from `localStorage` on mount
- `logout()` clears the `auth_token` and `auth_user` localStorage keys and sets `user`/`token` back to `null`
- All API calls in `src/api/productsApi.ts` must attach the JWT if present, falling back to the existing benchmark token if no JWT is stored

### Navigation — `src/components/NavBar.tsx`

- Logged out: show "Sign Up" and "Log In" links
- Logged in: show the username and a "Log Out" button
- Clicking "Log Out" calls `AuthContext.logout()` and redirects to `/login`

### Frontend technical constraints

- Do not modify any existing product-related context, hooks, or components
- Token must be stored in `localStorage` under key `auth_token` exactly — hidden tests depend on this key name
- The `password` field must never be stored in `localStorage` or in React state beyond the form input
- All new components must be typed with TypeScript — no `any`

### Frontend files to create or modify

- `src/context/AuthContext.tsx` — auth state and actions
- `src/pages/SignupPage.tsx` — signup form
- `src/pages/LoginPage.tsx` — login form
- `src/components/NavBar.tsx` — updated navigation with auth state
- `src/api/productsApi.ts` — attach JWT header if present
- `src/App.tsx` — register the `/signup` and `/login` routes and mount `AuthProvider`

---

## Success Criteria

- A new user can register via `POST /api/auth/register` and receive a JWT
- Duplicate email returns 409 with `"Email already registered"`
- Duplicate username returns 409 with `"Username already taken"`
- Password shorter than 8 characters returns 400
- A registered user can log in via `POST /api/auth/login` and receive a JWT
- Wrong password returns 401 with `"Invalid credentials"`
- `GET /api/auth/me` with a valid token returns the user object without the password field
- `GET /api/auth/me` with no token or an invalid token returns 401
- The backend password is never returned in any API response, and is stored as a bcrypt hash
- Frontend signup form stores token + user and redirects to `/` on success
- Frontend login form stores token + user and redirects to `/` on success
- Duplicate email/username on signup shows the server's inline error message
- Wrong credentials on login shows `"Invalid email or password"` inline
- Frontend logout clears `localStorage` and redirects to `/login`
- Navigation reflects authenticated state correctly
- The password is never stored in `localStorage` or React state beyond the form input
- All visible tests pass in both repos (`pnpm test`)
