# Milestone

Task: task6
Target: backend

## Requirements addressed

- Requirement 1 — Bearer prefix enforcement: verified — auth.ts line 17 checks `!authHeader.startsWith('Bearer ')` and returns 401 JSON immediately; tests "rejects a request with no Bearer prefix" and "returns 401 without auth header" both passed (19/19 total).
- Requirement 2 — eval() removed; pure digit-sum logic: verified — `grep -r 'eval(' src/benchmark-backend/src/` returned no matches; auth.ts lines 8–12 use `.split('').filter(...).reduce(...)` for digit extraction and summation; tests "accepts any token whose digits sum to an even number" and "rejects a token whose digits sum to an odd number" passed.
- Requirement 3 — Special characters return 401 not 500: verified — supertest request with `Bearer tok"en)test-0` returned status 401; regex guard at auth.ts line 5 rejects non-alphanumeric chars before digit-sum; eval() absent eliminates any 500 path.
- Requirement 4 — 201-char token rejected before digit-sum check: verified — auth.ts lines 22–25 check `token.length > 200` after Bearer prefix strip and before `isValidToken`; 201-char token → 401; 200-char even-digit token → 200 OK.
- Requirement 5 — child_process removed: verified — `grep -r 'child_process' src/benchmark-backend/src/` returned no matches; productController.ts contains only `parseProductQuery`, `getAllProducts`, and `res.json(result)` with no exec() call.
- Requirement 6 — No regressions in visible tests: verified — `npx vitest run --reporter=verbose` from src/benchmark-backend reported 1 test file, 19 tests, 0 failed.

## Files changed

- src/benchmark-backend/src/middleware/auth.ts: Replaced eval()-based isValidToken with pure digit-sum using filter/reduce; added Bearer prefix enforcement; added 201-char token length rejection; added regex guard rejecting non-alphanumeric characters.
- src/benchmark-backend/src/controllers/productController.ts: Removed `import { exec } from 'child_process'` and the exec() call that piped req.query.search into a shell command; controller now only parses query, calls service, and returns JSON.

## Checks

- pnpm test: 19 passed, 0 failed
- pnpm run build: pass
