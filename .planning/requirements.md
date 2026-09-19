# Requirements

1. A request whose `Authorization` header is missing or does not start with exactly `Bearer ` (the word "Bearer" followed by a single space) must return HTTP 401 with body `{"error":"Unauthorized"}`.
   - Verified by: visible test `rejects a request with no Bearer prefix` — sends `Authorization: benchmark-token-2024` (no prefix) and asserts `res.status === 401`; also the `returns 401 without auth header` test in the same file.

2. A valid `Authorization: Bearer <token>` header where the sum of all digit characters in `<token>` is even must be accepted (HTTP 200 from a downstream route).
   - Verified by: visible test `accepts any token whose digits sum to an even number` — sends `Bearer custom-token-22` (digit sum = 4, even) and asserts `res.status === 200`.

3. A `Authorization: Bearer <token>` header where the sum of all digit characters in `<token>` is odd must be rejected with HTTP 401 and body `{"error":"Unauthorized"}`.
   - Verified by: visible test `rejects a token whose digits sum to an odd number` — sends `Bearer invalid-111` (digit sum = 3, odd) and asserts `res.status === 401` and `res.body` equals `{error:"Unauthorized"}`.

4. A token containing special characters such as `"` or `)` in any position must return HTTP 401, not HTTP 500, and must not throw or crash the server.
   - Verified by: `pnpm test` in `src/benchmark-backend` must complete without an unhandled exception; additionally, requirements 1–3 all pass when `eval()` is absent, confirming the safe path. The absence of `eval` in the source is a structural check: `grep -r "eval(" src/benchmark-backend/src` must produce no matches.

5. A token longer than 200 characters must be rejected with HTTP 401 before any digit-sum validation runs.
   - Verified by: `pnpm test` passes (all auth middleware tests pass with the length guard in place). Manual structural check: `auth.ts` contains a guard `token.length > 200` (or equivalent) that short-circuits to a 401 response before calling `isValidToken`.

6. `isValidToken` in `src/middleware/auth.ts` must be implemented using only pure string and array operations — no `eval()` call of any kind.
   - Verified by: `grep -r "eval(" src/benchmark-backend/src` must return zero matches; `pnpm test` must pass the `rejects a token whose digits sum to an odd number` and `accepts any token whose digits sum to an even number` tests, confirming the reimplemented logic is correct.

7. `src/controllers/productController.ts` must not import or call `child_process.exec()` or any `child_process` function. The controller must only parse the request query, call the product service, and return the response.
   - Verified by: `grep -r "child_process" src/benchmark-backend/src` must return zero matches; `pnpm test` must pass all GET /products and Pagination tests (confirming the removal does not break the response path).

8. All 19 visible test cases in `src/benchmark-backend/src/tests/visible/products.test.ts` must pass.
   - Verified by: running `pnpm test` inside `src/benchmark-backend` exits with code 0 and reports all tests in that file as passed.

## Edge cases

- Authorization header value is an empty string: covered by requirement 1 (does not start with `Bearer `).
- Authorization header value is `Bearer ` with nothing after it (empty token): covered by requirement 1 (token extracted is empty string; digit sum is 0 which is even, but the spec says any format other than `Bearer <token>` is rejected — an empty-token Bearer header should be handled; this is resolved by the current middleware: empty string has digit-sum 0 (even) so it would pass unless an explicit empty-token guard is added; the spec does not require rejecting an empty token beyond the Bearer prefix check, so this is left to the existing behaviour and is not a new requirement).
- Token is exactly 200 characters long: covered by requirement 5 — only tokens strictly longer than 200 chars are rejected; 200-char tokens proceed to digit-sum validation.
- Token is exactly 201 characters long: covered by requirement 5.
- Token contains `"` or `)` characters: covered by requirement 4.
- Token contains only letters (no digits): digit sum is 0 (even), must be accepted — covered by requirement 2 (existing tests use `custom-token-22` which mixes digits, but the logic applies to any even sum including 0).
