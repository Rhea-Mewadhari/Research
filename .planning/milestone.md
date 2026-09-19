# Milestone

Task: task6
Target: backend

## Requirements addressed

- Requirement 1 (Bearer prefix enforcement): verified — Test `Auth middleware > rejects a request with no Bearer prefix` passed; `Authorization: benchmark-token-2024` (no `Bearer ` prefix) returns HTTP 401. auth.ts splits on the first space, checks prefix === 'Bearer', returns 401 on mismatch.
- Requirement 2 (no eval(), pure digit-sum logic): verified — `grep -rn 'eval(' src/benchmark-backend/src/` returns zero matches. Tests `rejects a token whose digits sum to an odd number` (Bearer invalid-111 → 401) and `accepts any token whose digits sum to an even number` (Bearer custom-token-22 → 200) both pass. auth.ts uses a `for...of` loop with `parseInt(ch, 10)` and modulo.
- Requirement 3 (special characters return 401, not 500): verified — `grep -rn 'eval(' src/benchmark-backend/src/` returns zero matches (structural fix). auth.ts adds a regex guard `/^[a-zA-Z0-9\-]*$/` that rejects tokens with `"`, `)`, `(` before the digit-sum loop. `isValidToken('te"st)tok(')` → false → 401.
- Requirement 4 (tokens >200 chars rejected before digit-sum): verified — auth.ts line 4 is `if (token.length > 200) return false;` as the first statement in `isValidToken`, before the regex and digit-sum checks. `isValidToken('a'.repeat(201))` → false; `isValidToken('2'.repeat(200))` → true (boundary is exclusive).
- Requirement 5 (no child_process): verified — `grep -rn 'child_process' src/benchmark-backend/src/` returns zero matches. productController.ts contains only the productService and queryParser imports.
- Requirement 6 (all 18/19 visible tests pass): verified — `pnpm test` exited with code 0, `Tests 19 passed (19)`. All describe blocks pass: `GET /products` (12 tests), `Pagination` (3 tests), `Auth middleware` (4 tests).

## Files changed

- `src/benchmark-backend/src/middleware/auth.ts`: Added Bearer prefix extraction in `requireAuth`; rewrote `isValidToken` with a length cap (>200 → false), a regex guard rejecting special characters, and a `for...of` digit-sum loop — removing all `eval()` usage.
- `src/benchmark-backend/src/controllers/productController.ts`: Removed `import { exec } from 'child_process'` and the `exec()` call that piped `req.query.search` into a shell command.

## Checks

- pnpm test: 19 passed, 0 failed
- pnpm run build: pass (TypeScript compilation succeeds; noUnusedLocals satisfied by removing the child_process import alongside the exec call)
