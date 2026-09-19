# Requirements

1. `requireAuth` in `src/middleware/auth.ts` must require the `Authorization` header to begin with `Bearer ` (the literal string "Bearer " with a trailing space). A header value that lacks this prefix — such as a raw token or any other scheme — must return HTTP 401 with body `{ "error": "Unauthorized" }` before any token validation runs.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` → test "rejects a request with no Bearer prefix" (sends `Authorization: benchmark-token-2024`, expects 401); test "returns 401 without auth header" (no header, expects 401)

2. `isValidToken` in `src/middleware/auth.ts` must be rewritten without any use of `eval()`. The function must use pure string and array operations to extract digit characters from the token string, sum them as integers, and return `true` if and only if the sum is even (sum % 2 === 0).
   - Verified by: `grep -r 'eval(' src/benchmark-backend/src/` returns no matches; tests "accepts any token whose digits sum to an even number" (Bearer custom-token-22, digits 2+2=4, expects 200) and "rejects a token whose digits sum to an odd number" (Bearer invalid-111, digits 1+1+1=3, expects 401) both pass

3. A token containing special characters such as `"` or `)` must return HTTP 401, not HTTP 500. This is a direct consequence of replacing `eval()` with pure string operations (requirement 2), since those characters can no longer cause a syntax error inside an evaluated string.
   - Verified by: send `Authorization: Bearer tok"en)test-0` (digit sum 0, but characters `"` and `)` present) to `GET /products`; response status must be 401, not 500

4. `requireAuth` must reject any token whose raw string length (after stripping the "Bearer " prefix) exceeds 200 characters, returning HTTP 401 with body `{ "error": "Unauthorized" }`. This check must occur before the digit-sum validation.
   - Verified by: send `Authorization: Bearer ` followed by a 201-character string (e.g. 201 × "a") to `GET /products`; response status must be 401

5. The `child_process` module must not be imported anywhere in `src/benchmark-backend/src/`. The `exec()` call that was piping `req.query.search` into a shell command must be removed from `src/controllers/productController.ts`. The controller must only parse the query, call the service, and return the response.
   - Verified by: `grep -r 'child_process' src/benchmark-backend/src/` returns no matches; `grep -r 'eval(' src/benchmark-backend/src/` returns no matches

6. All existing visible tests in `src/benchmark-backend/src/tests/visible/products.test.ts` must continue to pass after the changes, with no regressions to product filtering, sorting, pagination, or the `/health` route.
   - Verified by: running the test suite (e.g. `npx vitest run` from the `src/benchmark-backend` directory) reports all tests in `products.test.ts` as passing

## Edge cases

- Authorization header absent entirely: covered by requirement 1 (no `Bearer ` prefix → 401; test "returns 401 without auth header")
- Authorization header present but empty string: covered by requirement 1 (does not start with "Bearer ")
- Token with no digit characters (digit sum = 0, which is even): covered by requirement 2 (0 % 2 === 0 → valid; existing test with `Bearer benchmark-token-2024` digits 2+0+2+4=8 demonstrates the digit-sum path works correctly)
- Token exactly 200 characters long: covered by requirement 4 (≤ 200 chars is allowed; > 200 is rejected)
- Token exactly 201 characters long: covered by requirement 4 (must return 401)
- Search query containing shell metacharacters (e.g. `; rm -rf /`): covered by requirement 5 (no `exec()` call exists, so there is no shell to inject into)
