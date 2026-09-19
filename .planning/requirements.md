# Requirements

1. `requireAuth` must enforce the `Bearer` prefix: only an `Authorization` header of the form `Bearer <token>` is accepted; any header that lacks the `Bearer ` prefix (including a raw token with no prefix, an empty string, or any other format) must return HTTP 401 with body `{ "error": "Unauthorized" }`.
   - Verified by: visible test `'rejects a request with no Bearer prefix'` in `src/tests/visible/products.test.ts` — sends `Authorization: benchmark-token-2024`, expects `res.status === 401`.

2. `isValidToken` must not use `eval()`: the function must be rewritten using only pure string and array operations (e.g. `String.prototype.match`, `Array.prototype.reduce`, `parseInt`) to extract digits from the token string and compute their sum. The digit-sum logic itself is unchanged — a token is valid when the sum of its digit characters is even.
   - Verified by: `grep -rn 'eval(' src/benchmark-backend/src/` returns zero matches; AND visible tests `'rejects a token whose digits sum to an odd number'` (sends `Bearer invalid-111`, expects 401) and `'accepts any token whose digits sum to an even number'` (sends `Bearer custom-token-22`, expects 200) both pass.

3. A token that contains special characters such as `"` or `)` must return HTTP 401, not HTTP 500. The fix is structural (no `eval()`) so this is a consequence of Requirement 2, but it is independently verifiable.
   - Verified by: `grep -rn 'eval(' src/benchmark-backend/src/` returning zero matches (guarantees no code-injection path) AND a direct supertest call with `Authorization: Bearer te"st)tok(` returning `res.status === 401`.

4. Tokens longer than 200 characters must be rejected with HTTP 401 before any digit-sum validation is performed. The length check must be the first guard applied to the extracted token string.
   - Verified by: a supertest request with `Authorization: Bearer ` followed by a 201-character alphanumeric string returns `res.status === 401` and `res.body` equals `{ error: 'Unauthorized' }`.

5. `productController.ts` must not import or invoke `child_process` in any form. The `exec` call that pipes `req.query.search` into a shell command must be removed entirely, along with the `import { exec } from 'child_process'` statement.
   - Verified by: `grep -rn 'child_process' src/benchmark-backend/src/` returns zero matches.

6. All existing visible tests in `src/benchmark-backend/src/tests/visible/products.test.ts` must pass without modification to any test file. This covers the full `GET /products`, `Pagination`, and `Auth middleware` describe blocks (18 tests total).
   - Verified by: `pnpm --filter benchmark-backend test` exits with code 0 and reports all 18 visible test cases as passing.

## Edge cases

- Raw token with no prefix (`Authorization: benchmark-token-2024`): covered by Requirement 1.
- Empty `Authorization` header (`Authorization: `): covered by Requirement 1 (no `Bearer ` prefix).
- Missing `Authorization` header entirely: covered by Requirement 1 (existing behaviour, `authHeader` is undefined → 401).
- Token containing `"` (double-quote): covered by Requirement 3.
- Token containing `)` or `(`: covered by Requirement 3.
- Token of exactly 200 characters: must be accepted if digit-sum is even; only tokens of 201+ characters are rejected — covered by Requirement 4.
- Token of 201 characters: rejected with 401 before digit-sum — covered by Requirement 4.
- Token whose digits sum to an odd number (e.g. `invalid-111` → digits 1+1+1=3): rejected with 401 — covered by Requirement 2.
- Token whose digits sum to an even number (e.g. `custom-token-22` → digits 2+2=4): accepted — covered by Requirement 2.
- `exec` called with user-supplied search string (command injection): covered by Requirement 5.
- No search query parameter (`req.query.search` undefined): no crash after Requirement 5 fix because the exec call is fully removed.
