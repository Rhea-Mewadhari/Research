# Requirements

<!-- Target: backend (task12) -->

## Database

1. `src/benchmark-backend/src/db/migrations/004_users.sql` exists and contains a `CREATE TABLE users` statement with columns: `id TEXT PRIMARY KEY`, `email TEXT NOT NULL UNIQUE`, `username TEXT NOT NULL UNIQUE`, `password TEXT NOT NULL`, `created_at TEXT NOT NULL DEFAULT (datetime('now'))`.
   - Verified by: file is present at that exact path; running the visible test suite causes the migration runner to apply it — `auth.test.ts` line 61 queries `SELECT password FROM users WHERE email = ?` against the live DB and receives a row, which would fail with "no such table" if the migration were absent.

## Dependencies

2. `jsonwebtoken` and `bcryptjs` (or `bcrypt`) appear in the `dependencies` block of `src/benchmark-backend/package.json`; their corresponding `@types/*` packages appear in `devDependencies`.
   - Verified by: inspecting `package.json` for the four package names; `pnpm test` in `benchmark-backend` does not fail at the import stage with "Cannot find module 'jsonwebtoken'" or "Cannot find module 'bcryptjs'".

## Zod Schemas

3. `src/benchmark-backend/src/schemas/authSchema.ts` exists and exports `registerSchema` — a Zod object accepting `email` (string, valid email format), `username` (non-empty string), and `password` (string, minimum 8 characters) — and `loginSchema` — a Zod object accepting `email` (string) and `password` (string).
   - Verified by: file is present; TypeScript build (`tsc --noEmit`) passes; validation rejection tests (requirements 7–9) pass, which exercise the schema via the register controller.

## POST /api/auth/register

4. `POST /api/auth/register` with valid `{ email, username, password }` (password ≥ 8 chars, valid email format) returns HTTP `201` with JSON body `{ user: { id, email, username, createdAt }, token }`. `user.id` is any string, `user.createdAt` is any string, `user.password` is absent from the body, and `token` is any string.
   - Verified by: `auth.test.ts` — "registers a new user and returns 201 with a user object and token" (line 25); "never includes the password anywhere in the response body" (line 43).

5. The password stored in the `users` table after registration is a bcrypt hash matching `/^\$2[aby]?\$/` — never the submitted plaintext value.
   - Verified by: `auth.test.ts` — "stores the password as a bcrypt hash, not plaintext" (line 53), which reads the `password` column directly from the DB via `db.prepare(...).get(email)`.

6. The `token` returned by `POST /api/auth/register` is a three-segment dot-separated string (JWT). Decoding its payload (base64url, middle segment) yields `{ userId: <user.id>, email: <submitted email>, username: <submitted username> }`.
   - Verified by: `auth.test.ts` — "issues a JWT carrying userId, email, and username claims" (line 69), which splits on `'.'`, asserts length 3, and asserts all three payload claims.

7. `POST /api/auth/register` returns HTTP `400` for each of: (a) password shorter than 8 characters, (b) missing password field, (c) invalid email format (e.g. `"not-an-email"`).
   - Verified by: `auth.test.ts` — "rejects a password shorter than 8 characters with 400" (line 85); "rejects a missing password with 400" (line 95); "rejects an invalid email format with 400" (line 104).

8. `POST /api/auth/register` with an email address that already exists in the `users` table returns HTTP `409` with JSON body `{ "error": "Email already registered" }` (exact string).
   - Verified by: `auth.test.ts` — "returns 409 'Email already registered' for a duplicate email" (line 114), which asserts `res.status === 409` and `res.body.error === 'Email already registered'`.

9. `POST /api/auth/register` with a username that already exists in the `users` table returns HTTP `409` with JSON body `{ "error": "Username already taken" }` (exact string).
   - Verified by: `auth.test.ts` — "returns 409 'Username already taken' for a duplicate username" (line 131), which asserts `res.status === 409` and `res.body.error === 'Username already taken'`.

## POST /api/auth/login

10. `POST /api/auth/login` with `{ email, password }` matching an existing user returns HTTP `200` with JSON body `{ user: { id, email, username, createdAt }, token }`. `user.password` is absent from the body.
    - Verified by: `auth.test.ts` — "logs in with valid credentials and returns 200 with a user and token" (line 160).

11. `POST /api/auth/login` with a correct email but incorrect password returns HTTP `401` with JSON body `{ "error": "Invalid credentials" }` (exact string).
    - Verified by: `auth.test.ts` — "returns 401 'Invalid credentials' for a wrong password" (line 173).

12. `POST /api/auth/login` with an email address that does not exist in the `users` table returns HTTP `401` with JSON body `{ "error": "Invalid credentials" }` — identical to the wrong-password message (no user enumeration).
    - Verified by: `auth.test.ts` — "returns 401 'Invalid credentials' for an unknown email (same message as a wrong password)" (line 183).

## GET /api/auth/me

13. `GET /api/auth/me` with a valid `Authorization: Bearer <jwt>` header returns HTTP `200` with the user object (`{ id, email, username, createdAt }`) and no `password` field.
    - Verified by: `auth.test.ts` — "returns the user object for a valid token, without the password field" (line 207), which asserts `res.status === 200`, `res.body.email === ME_USER.email`, `res.body.username === ME_USER.username`, and `res.body.password === undefined`.

14. `GET /api/auth/me` with no `Authorization` header returns HTTP `401`.
    - Verified by: `auth.test.ts` — "returns 401 when no Authorization header is provided" (line 218).

15. `GET /api/auth/me` with a malformed or invalid token in the `Authorization: Bearer` header returns HTTP `401`.
    - Verified by: `auth.test.ts` — "returns 401 for a malformed or invalid token" (line 223), which sets `Authorization: Bearer not-a-real-jwt`.

## requireJwt Middleware

16. `src/benchmark-backend/src/middleware/requireJwt.ts` exists, exports a `requireJwt` function, and reads the JWT secret exclusively from `process.env.JWT_SECRET` (no hardcoded secret string in the source file). On a valid bearer token it attaches the decoded payload to the request and calls `next()`; on a missing header, invalid token, or expired token it responds with HTTP `401` and does not call `next()`.
    - Verified by: file present at that path; grepping the source for any literal that looks like a JWT secret string finds none; requirements 14 and 15 pass (which exercise the 401 branches via supertest).

17. `src/benchmark-backend/src/middleware/auth.ts` (the existing `requireAuth` benchmark middleware) is not modified.
    - Verified by: `git diff src/benchmark-backend/src/middleware/auth.ts` produces no output.

## Route and App Wiring

18. `src/benchmark-backend/src/routes/authRoutes.ts` exists and registers `POST /register`, `POST /login`, and `GET /me` (with `requireJwt` applied to `/me`) mapped to the corresponding controller functions.
    - Verified by: file present; all three auth endpoints in `auth.test.ts` return their expected HTTP statuses rather than 404.

19. `src/benchmark-backend/src/app.ts` imports the auth router and mounts it at `/api/auth`, before the 404 fallback handler.
    - Verified by: `auth.test.ts` exercises `/api/auth/register`, `/api/auth/login`, and `/api/auth/me` — none return 404; existing routes (`/api/products`, `/products`, `/api/favourites`) continue to function.

## Error Handling

20. All auth endpoint errors (400, 401, 409) flow through the existing `errorHandler` middleware in `src/middleware/errorHandler.ts`. The `errorHandler` file is not modified.
    - Verified by: `git diff src/benchmark-backend/src/middleware/errorHandler.ts` produces no output; error responses in `auth.test.ts` tests use the `{ error: "..." }` shape the errorHandler produces for `AppError` subclasses.

## Password Never in Responses

21. The `password` field of a `users` row never appears in any HTTP response body from the register, login, or me endpoints.
    - Verified by: `auth.test.ts` — `res.body.user.password` is asserted `toBeUndefined()` for register (line 39), login (line 169), and me (line 215); `JSON.stringify(res.body)` does not contain the submitted plaintext string `'plaintext-secret'` (line 50).

## TypeScript and Express.d.ts

22. `src/benchmark-backend/src/types/express.d.ts` is extended to declare a `jwtUser` field (or equivalent name used in `requireJwt`) on the Express `Request` interface, so the decoded JWT payload is accessible without a type assertion in controller code.
    - Verified by: TypeScript build (`tsc --noEmit`) passes with no `any`-related type errors in `authController.ts` or `requireJwt.ts`.

## Full Test Suite

23. Running `pnpm test` inside `src/benchmark-backend` exits with code `0`, with all cases in `src/tests/visible/auth.test.ts` and `src/tests/visible/products.test.ts` green and no compilation errors.
    - Verified by: `pnpm test` exit code 0 in `src/benchmark-backend`.

---

## Edge Cases

- **Password exactly 8 characters:** valid — requirement 7 rejects strictly less than 8; 8-char password must succeed (tested implicitly by "supersecret123" in requirement 4 which is 14 chars — hidden tests may exercise the boundary; implementation must use `z.string().min(8)`, not `> 8`).
- **Empty string for `email` or `username`:** rejected by Zod as invalid — covered by requirement 7 (ValidationError → 400).
- **Expired JWT on `/me`:** treated as invalid and returns 401 — covered by requirement 16 (expired is listed alongside missing/invalid in the middleware contract).
- **Email vs username duplicate order:** when both are duplicates the email check fires first; the two 409 tests each register a unique counterpart value so only one constraint is violated per test — requirements 8 and 9 cover them independently.
- **Migration auto-pickup:** `migrate.ts` scans `migrations/` alphabetically via `readdirSync`; `004_users.sql` sorts after `003_featured.sql` and will be applied automatically — covered by requirement 1 (table existence is proven by requirement 5's DB query succeeding).
- **`products.test.ts` regression:** mounting `/api/auth` must not interfere with `/api/products`, `/products`, or `/api/favourites` — covered by requirement 23 (both test files must pass).
- **`JWT_SECRET` absent from env:** undefined behaviour; the only constraint is that the secret is read from the environment, not hardcoded — covered by requirement 16.


1. `AuthContext.tsx` exports a named `AuthProvider` component that wraps children and provides auth state.
   - Verified by: `authLogin.test.tsx` and `authSignup.test.tsx` import `{ AuthProvider }` from `'../src/context/AuthContext'` — TypeScript compilation fails if the named export is absent.

2. `AuthContext` exposes `user: User | null`, `token: string | null`, and `isAuthenticated: boolean` to consumers.
   - Verified by: TypeScript build (`pnpm --filter benchmark-frontend build` or `tsc --noEmit`) passes without type errors.

3. `AuthContext` exposes `login(email: string, password: string): Promise<void>`, `register(email: string, username: string, password: string): Promise<void>`, and `logout(): void` actions.
   - Verified by: TypeScript build passes; consumers in `LoginPage` / `SignupPage` / `NavBar` compile correctly.

4. On mount, `AuthProvider` reads `localStorage.getItem('auth_token')` and `localStorage.getItem('auth_user')` and populates `token` / `user` / `isAuthenticated` from those values before first render.
   - Verified by: `authNavBar.test.tsx` — test "shows the username and a Log Out button when logged in" seeds `localStorage` before rendering; if hydration were missing the username would not appear.

5. `logout()` removes `auth_token` and `auth_user` from `localStorage` and resets `user` and `token` to `null`.
   - Verified by: `authNavBar.test.tsx` — test "logging out clears localStorage and redirects to /login" asserts `localStorage.getItem('auth_token')` is `null` and `localStorage.getItem('auth_user')` is `null` after clicking Log Out.

---

## SignupPage (`src/pages/SignupPage.tsx`)

6. `SignupPage` renders four labelled form fields: email (`<label>` text matching `/^email$/i`), username (`/^username$/i`), password (`/^password$/i`), and confirm password (`/confirm password/i`); all accessible via `getByLabelText`.
   - Verified by: `authSignup.test.tsx` — test "renders email, username, password, and confirm password fields" calls `getByLabelText` for each; the test throws if any label is missing.

7. When confirm-password does not match password, submitting the form shows an inline error matching `/passwords? (do not|don't) match/i` and makes no network request.
   - Verified by: `authSignup.test.tsx` — test "catches a confirm-password mismatch client-side and never issues a request" asserts `fetchMock` is not called and the error text is visible.

8. On a successful `POST /api/auth/register` (status 201), `auth_token` is written to `localStorage` with the token value, `auth_user` is written with the JSON-stringified user object, and the user is redirected to `/`.
   - Verified by: `authSignup.test.tsx` — test "on success stores the token and user in localStorage and redirects to /": asserts `localStorage.getItem('auth_token') === 'signed.jwt.token'`, `auth_user` parses to `{ username: 'new_user', email: 'new-user@example.com' }`, and `data-testid="home-page"` appears.

9. On a `409` response from `POST /api/auth/register`, the server's `error` string is displayed inline on the page, and no token is stored.
   - Verified by: `authSignup.test.tsx` — test "on a 409 conflict, shows the server error message inline and does not persist a session": asserts `/email already registered/i` appears on screen and `localStorage.getItem('auth_token')` is `null`.

10. On a `400` response from `POST /api/auth/register`, field-level error messages from the response `details` array are displayed inline.
    - Verified by: `authSignup.test.tsx` — test "on a 400 validation error, shows the field-level error message from the server": server returns `{ details: [{ field: 'username', message: 'Username may only contain letters, numbers, and underscores' }] }`; asserts that text appears on screen.

11. The submit button (with accessible name matching `/sign up/i`) is disabled while the `POST /api/auth/register` request is in flight.
    - Verified by: `authSignup.test.tsx` — test "shows a loading state on the submit button while the request is in flight": clicks submit while fetch is pending, asserts `submitBtn` is `disabled`.

---

## LoginPage (`src/pages/LoginPage.tsx`)

12. `LoginPage` renders two labelled form fields: email (`/^email$/i`) and password (`/^password$/i`), both accessible via `getByLabelText`.
    - Verified by: `authLogin.test.tsx` — test "renders email and password fields".

13. On a successful `POST /api/auth/login` (status 200), `auth_token` and `auth_user` are written to `localStorage` and the user is redirected to `/`.
    - Verified by: `authLogin.test.tsx` — test "on success stores the token and user in localStorage and redirects to /": asserts `localStorage.getItem('auth_token') === 'signed.jwt.token'`, `auth_user` parses correctly, and `data-testid="home-page"` appears.

14. On a `401` response from `POST /api/auth/login`, the page displays `"Invalid email or password"` inline — never the raw server message `"Invalid credentials"` — and no token is stored.
    - Verified by: `authLogin.test.tsx` — test "on 401 shows 'Invalid email or password' and never the raw server message": asserts `/invalid email or password/i` is present, `/^invalid credentials$/i` is absent, and `localStorage.getItem('auth_token')` is `null`.

15. The submit button (accessible name `/log in/i`) is disabled while the `POST /api/auth/login` request is in flight.
    - Verified by: `authLogin.test.tsx` — test "shows a loading state on the submit button while the request is in flight": asserts button is `disabled` while fetch is pending.

---

## NavBar (`src/components/NavBar.tsx`)

16. When no user is authenticated (no `auth_token` in `localStorage`), `NavBar` renders a link with accessible name `/sign up/i` and a link with accessible name `/log in/i`; the Log Out button is absent.
    - Verified by: `authNavBar.test.tsx` — test "shows Sign Up and Log In links when logged out".

17. When a user is authenticated (`auth_token` and `auth_user` in `localStorage`), `NavBar` renders the user's `username` as visible text and a button with accessible name `/log out/i`; the Sign Up and Log In links are absent.
    - Verified by: `authNavBar.test.tsx` — test "shows the username and a Log Out button when logged in".

18. Clicking the Log Out button calls `logout()` (clears `auth_token` and `auth_user` from `localStorage`) and navigates to `/login`.
    - Verified by: `authNavBar.test.tsx` — test "logging out clears localStorage and redirects to /login": asserts `data-testid="login-page"` appears and both `localStorage` keys are `null`.

---

## productsApi (`src/api/productsApi.ts`)

19. When `localStorage` contains `auth_token`, `fetchProducts` attaches `Authorization: Bearer <stored-jwt>` as the `Authorization` request header.
    - Verified by: `authProductsApiToken.test.ts` — test "attaches the stored JWT as the Authorization header when one is present": sets `localStorage.auth_token = 'stored.jwt.token'`, calls `fetchProducts(1)`, asserts `init.headers.Authorization === 'Bearer stored.jwt.token'`.

20. When `localStorage` does not contain `auth_token`, `fetchProducts` falls back to `Authorization: Bearer benchmark-token-2024`.
    - Verified by: `authProductsApiToken.test.ts` — test "falls back to the existing benchmark token when no JWT is stored".

---

## App.tsx

21. `App.tsx` mounts `AuthProvider` around (or alongside) the existing providers so that all routes can consume `AuthContext`.
    - Verified by: `authNavBar.test.tsx` wraps `NavBar` with `AuthProvider` independently — if the context were missing from `App`, runtime errors would cause `app.render.test.tsx` to fail; `pnpm test` passes for `app.render.test.tsx`.

22. `App.tsx` registers a `/signup` route that renders `SignupPage` and a `/login` route that renders `LoginPage`.
    - Verified by: TypeScript build passes with `SignupPage` and `LoginPage` imports wired to those paths; `authSignup.test.tsx` and `authLogin.test.tsx` test the pages in isolation via `MemoryRouter`.

---

## ProtectedRoute (`src/components/ProtectedRoute.tsx`)

23. A `ProtectedRoute` component exists and, when rendered for an unauthenticated user (no `auth_token` in `localStorage`), redirects to `/login` instead of rendering its children.
    - Verified by: TypeScript build passes (file exists and exports a valid component); hidden test suite (referenced by the deleted `protectedRoute.test.tsx` visible-test peer) will assert redirect behaviour.

---

## Regression — existing visible tests must continue to pass

24. The five pre-existing non-auth visible test suites (`app.render.test.tsx`, `clearFilters.test.tsx`, `filtering.test.tsx`, `loadingError.test.tsx`, `pagination.test.tsx`, `sorting.test.tsx`) all pass after the auth changes are applied.
    - Verified by: `pnpm --filter benchmark-frontend test` exits 0 with all test suites green.

---

## Edge Cases

- **Hydration with malformed `auth_user`:** If `localStorage.auth_user` contains invalid JSON, `AuthProvider` must not throw on mount — caught by requirement 4 (the test seeds valid JSON; implementation should guard against parse errors).
- **Confirm-password check fires client-side, not server-side:** requirement 7 verifies `fetch` is never called when passwords mismatch — the guard must run before form submission reaches the network.
- **401 error message is hardcoded, not derived from server:** requirement 14 explicitly asserts the server's `"Invalid credentials"` string must NOT appear — the frontend must substitute its own copy.
- **JWT takes strict priority over fallback token:** requirement 19 sets `auth_token` and asserts the JWT is used; requirement 20 clears `auth_token` (no localStorage seed) and asserts the benchmark token is used — no blending.
- **`auth_token` key name is exact:** hidden tests depend on the key `auth_token` (not `authToken`, `token`, etc.) — covered by requirements 8, 13, 19, 20.
- **Password never stored in state beyond form input:** covered by TypeScript constraints (no `any`); the `User` type must not include a `password` field.
- **Log Out clears both keys, not just one:** requirement 18 asserts both `auth_token` and `auth_user` are `null` after logout.
