# Requirements

1. A request whose `Authorization` header does not begin with the literal string `"Bearer "` (the word "Bearer" followed by exactly one space) returns HTTP 401 with JSON body `{"error": "Unauthorized"}`.
   - Verified by: visible test `rejects a request with no Bearer prefix` in `src/benchmark-backend/src/tests/visible/products.test.ts` — sends `Authorization: benchmark-token-2024` (no prefix), asserts `res.status === 401`.

2. A request whose token (the portion of the `Authorization` header after `"Bearer "`) is longer than 200 characters returns HTTP 401 with JSON body `{"error": "Unauthorized"}` before any digit-sum validation runs.
   - Verified by: `pnpm --filter benchmark-backend test` exits 0 (all visible tests pass); the check is additionally confirmed by the explicit success criterion in `TASK6.md`: "Token longer than 200 characters returns 401".

3. `src/benchmark-backend/src/middleware/auth.ts` contains no call to `eval()`.
   - Verified by: `grep -n "eval(" src/benchmark-backend/src/middleware/auth.ts` returns no matches.

4. `isValidToken` correctly implements the digit-sum check using pure string/array operations (no `eval`): extract all digit characters from the token string, sum their numeric values, return `true` iff the sum is even.
   - Verified by: visible tests `rejects a token whose digits sum to an odd number` (`Bearer invalid-111` → 401) and `accepts any token whose digits sum to an even number` (`Bearer custom-token-22` → 200) both pass in `pnpm --filter benchmark-backend test`.

5. A token containing the character `"` or `)` returns HTTP 401 — not HTTP 500.
   - Verified by: success criterion in `TASK6.md`; guaranteed once `eval()` is removed (requirement 3) and the Bearer-prefix extraction correctly isolates the token before passing it to `isValidToken` (requirement 4).

6. `src/benchmark-backend/src/controllers/productController.ts` does not import `child_process` and contains no `exec()` call.
   - Verified by: `grep -n "child_process\|exec(" src/benchmark-backend/src/controllers/productController.ts` returns no matches.

7. `child_process` is not imported anywhere in the backend codebase.
   - Verified by: `grep -rn "child_process" src/benchmark-backend/src/` returns no matches.

8. All visible tests in `src/benchmark-backend/src/tests/visible/products.test.ts` pass without modification (product listing, filtering, sorting, pagination, search, auth).
   - Verified by: `pnpm --filter benchmark-backend test` exits with code 0 and all 18 test cases report passing.

---

## Edge cases

- **Token with no digits** (e.g., `Bearer abc`): digit sum = 0 (even) → accepted with 200; covered by requirement 4.
- **Token exactly 200 characters long**: not rejected by length check → proceeds to digit-sum validation; covered by requirement 2 (only > 200 is rejected).
- **Token 201+ characters long**: rejected with 401 before digit-sum runs; covered by requirement 2.
- **`Authorization` header absent entirely**: token is null → 401; covered by requirement 8 (existing test `returns 401 without auth header`).
- **`Authorization: Bearer` (no trailing space or token)**: does not match `"Bearer "` prefix → 401; covered by requirement 1.
- **Token containing `"` or `)` special characters**: returns 401 (invalid digit sum), never 500; covered by requirement 5.
- **Search query containing shell metacharacters** (e.g., `; rm -rf /`): no shell execution path exists once `exec()` is removed; covered by requirements 6 and 7.
