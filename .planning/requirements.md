# Requirements

1. A dedicated named filter function must exist in `productService.ts` that accepts a product array and a query object and applies all three filters (search, category, inStock). `getAllProducts` must not contain any inline `.filter(` calls.
   - Verified by: `grep -n "\.filter(" src/benchmark-backend/src/services/productService.ts` returns zero matches inside the `getAllProducts` function body; a separate named function containing the filter logic is present in the file.

2. A dedicated named sort function must exist in `productService.ts` that accepts a product array and a sort string and handles all four sort values (`price_asc`, `price_desc`, `name_asc`, `name_desc`). `getAllProducts` must not contain any inline `.sort(` calls.
   - Verified by: `grep -n "\.sort(" src/benchmark-backend/src/services/productService.ts` returns zero matches inside the `getAllProducts` function body; a separate named function containing sort logic is present in the file.

3. `getAllProducts` must follow exactly the sequence: fetch → filter → sort → paginate → return — each as a single delegating call with no inlined logic.
   - Verified by: reading `productService.ts` confirms `getAllProducts` body contains no `.filter(`, `.sort(`, or conditional branching on `query.search`, `query.category`, `query.inStock`, or `query.sort` directly; all such logic lives in the helper functions.

4. The exported function `sanitizeSearch` must not appear anywhere in `productService.ts`.
   - Verified by: `grep -n "sanitizeSearch" src/benchmark-backend/src/services/productService.ts` produces no output.

5. No redundant boolean comparisons remain in `productService.ts`: none of `=== true`, `=== false`, or `!== undefined` appear in the file.
   - Verified by: `grep -En "=== true|=== false|!== undefined" src/benchmark-backend/src/services/productService.ts` produces no output.

6. All existing tests pass without modification.
   - Verified by: `cd src/benchmark-backend && npx vitest run` exits with code 0 and all test cases in `src/tests/visible/products.test.ts` report as passed.

7. Only `productService.ts` is modified — no other source file changes.
   - Verified by: `git diff --name-only` lists only `src/benchmark-backend/src/services/productService.ts`.

## Edge cases

- No filter params supplied: covered by requirement 1 (filter helper returns full product array unchanged) — verified by test "returns all products with pagination envelope".
- Unknown/undefined sort value: covered by requirement 2 (sort helper returns array unchanged when sort is undefined or unrecognised) — verified by default pagination tests.
- Case-insensitive search: covered by requirement 1 (search and category comparisons use `.toLowerCase()`) — verified by test "filters by category" and "filters in-stock products".
- inStock idiomatic check: covered by requirement 5 — `p.inStock === true` becomes `p.inStock` and `p.inStock === false` becomes `!p.inStock`.
- `sanitizeSearch` import elsewhere: covered by requirement 7 (no other files changed, so any import would cause a compile/test error surfaced by requirement 6).
