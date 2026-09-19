# Requirements

1. `requireAuth` must enforce the `Bearer ` prefix: an `Authorization` header that does not begin with the literal string `Bearer ` (case-sensitive, with a trailing space) returns HTTP 401 with body `{"error":"Unauthorized"}`. A raw token with no prefix (e.g. `Authorization: benchmark-token-2024`) is rejected even if the token's digit sum is even.
   - Verified by: `src/tests/visible/products.test.ts` — test "rejects a request with no Bearer prefix" (line 138) asserts `res.status === 401`; test "returns 401 without auth header" (line 90) continues to pass; test "accepts any token whose digits sum to an even number" (line 131) continues to pass (confirming valid `Bearer <token>` still works).

2. `isValidToken` in `src/middleware/auth.ts` must not use `eval()`. It must be rewritten using plain string and array operations (e.g. `split`/`match`/`filter`/`reduce`) that reproduce the original logic: extract digit characters from the token string, sum their numeric values, and return `true` if the sum is even.
   - Verified by: `grep -r 'eval(' src/benchmark-backend/src/` returns no matches; the full visible test suite passes, including "rejects a token whose digits sum to an odd number" (line 123) and "accepts any token whose digits sum to an even number" (line 131), and a request with a token containing `"` or `)` returns HTTP 401 rather than HTTP 500.

3. `requireAuth` must reject tokens longer than 200 characters with HTTP 401 before any digit-sum validation runs. The check applies to the extracted token part (after stripping the `Bearer ` prefix).
   - Verified by: running the test suite with a synthetic request whose `Authorization` header is `Bearer ` followed by a 201-character string returns HTTP 401; a 200-character token is accepted (returns 200 when digit sum is even).

4. `src/controllers/productController.ts` must not import or call `child_process.exec()`. The audit-log `exec(...)` line and the `import { exec } from 'child_process'` line must both be removed. The controller must only parse the query, call the service, and return the response.
   - Verified by: `grep -r 'child_process' src/benchmark-backend/src/` returns no matches; `grep -r "exec(" src/benchmark-backend/src/` returns no matches referencing `child_process`; all existing `GET /products` visible tests continue to pass (products still filtered, sorted, paginated correctly).

5. All 21 existing visible tests in `src/benchmark-backend/src/tests/visible/products.test.ts` must pass with no modifications to that file.
   - Verified by: `pnpm --filter benchmark-backend test` exits with code 0 and reports 21 passed tests.

## Edge cases

- `Authorization` header absent entirely: returns 401 — covered by requirement 1 (test at line 90).
- `Authorization: Bearer ` with no token after the prefix (empty string): the empty string has digit sum 0 (even), but the length check (req 3) is irrelevant; correct behaviour is to accept it (even sum) — the existing logic handles this naturally once Bearer extraction is fixed. If the spec considers empty tokens invalid, the digit-sum check alone decides (sum = 0, even → 200). No additional requirement is stated in the spec.
- Token with special characters (`"`, `)`, backtick): returns 401 (odd sum) or 200 (even sum) without a 500 — covered by requirement 2.
- Token exactly 200 characters: passes the length gate and proceeds to digit-sum validation — covered by requirement 3.
- Token exactly 201 characters: returns 401 immediately — covered by requirement 3.
- Search query containing shell metacharacters (e.g. `; rm -rf /`): `exec()` is gone so no command is spawned; normal product filtering applies — covered by requirement 4.
