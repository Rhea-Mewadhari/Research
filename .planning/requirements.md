# Requirements

1. A module-scope function named `filterProducts` exists in `productService.ts` and handles all three filter dimensions (search, category, inStock). `getAllProducts` calls `filterProducts` and contains none of the filter logic itself.
   - Verified by: `grep -n 'function filterProducts' src/benchmark-backend/src/services/productService.ts` returns exactly one match at module scope; `grep -n 'filter\b' src/benchmark-backend/src/services/productService.ts` shows no `.filter(` calls inside the body of `getAllProducts`

2. A module-scope function named `sortProducts` exists in `productService.ts` and handles all four sort variants (price_asc, price_desc, name_asc, name_desc). `getAllProducts` calls `sortProducts` and contains none of the sort logic itself.
   - Verified by: `grep -n 'function sortProducts' src/benchmark-backend/src/services/productService.ts` returns exactly one match at module scope; `grep -n '\.sort(' src/benchmark-backend/src/services/productService.ts` shows no `.sort(` calls inside the body of `getAllProducts`

3. `getAllProducts` follows the exact orchestration order: fetch → filter → sort → paginate → return, with no logic other than pagination inlined.
   - Verified by: reading `getAllProducts` in `productService.ts` — the function body contains calls to `fetchAllProducts`, `filterProducts`, `sortProducts`, and pagination arithmetic in that order, with no `.filter(` or `.sort(` calls present

4. The `sanitizeSearch` export is removed from `productService.ts`.
   - Verified by: `grep -n 'sanitizeSearch' src/benchmark-backend/src/services/productService.ts` returns no matches

5. No redundant boolean comparisons (`=== true`, `=== false`, `!== undefined`) remain anywhere in `productService.ts`.
   - Verified by: `grep -nE '=== true|=== false|!== undefined' src/benchmark-backend/src/services/productService.ts` returns no matches

6. Sort logic inside `sortProducts` uses a single `if / else if / else if / else if` chain (not four independent `if` blocks).
   - Verified by: reading `sortProducts` in `productService.ts` — exactly one leading `if` and three `else if` branches for the four sort keys, with no standalone `if` for the 2nd–4th variants

7. Only `src/benchmark-backend/src/services/productService.ts` is modified; no other file is changed.
   - Verified by: `git diff --name-only` shows exactly one file: `src/benchmark-backend/src/services/productService.ts`

8. All 19 tests in `src/benchmark-backend/src/tests/visible/products.test.ts` pass with exit code 0.
   - Verified by: running `npm test` (or `npx vitest run`) in `src/benchmark-backend` and confirming the output shows 0 failed tests and the process exits 0

9. The response envelope shape `{ data, total, page, limit, totalPages }` is preserved with identical semantics: `data` is the paginated slice, `total` is the pre-pagination count, `page`/`limit` echo the query params (defaulting to 1 and 10), `totalPages` is `Math.ceil(total / limit)`.
   - Verified by: the Pagination describe-block tests in `products.test.ts` passing (requirement 8 covers this; called out explicitly because envelope shape must not change)

## Edge cases

- `inStock` falsy value (`false`, not just `undefined`): covered by requirement 1 (filterProducts handles both truthy and falsy inStock) and by the "filters out-of-stock products" test in requirement 8
- `query.sort` with an unrecognised value: covered by requirement 6 — the else-if chain falls through without sorting, matching current behaviour
- No query params at all: covered by requirement 8 — the "returns all products with pagination envelope" test passes with defaults
- `sanitizeSearch` still imported elsewhere: covered by requirement 4 — if the export is removed and anything imports it, the TypeScript build or test suite will fail, which requirement 8 catches
