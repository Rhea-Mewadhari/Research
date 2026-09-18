# Requirements

1. A `filterProducts` helper function exists in `src/services/productService.ts` that
   accepts the full product array and the `ProductQuery` object, applies search, category,
   and inStock filtering, and returns the filtered array without mutating its input.
   - Verified by: `grep -n 'function filterProducts' src/benchmark-backend/src/services/productService.ts` returns exactly one hit; running `pnpm --filter benchmark-backend test` passes all filter-related cases (filters by category, filters in-stock, filters out-of-stock, filters by search term, returns empty for unknown category, returns empty for no-match search).

2. A `sortProducts` helper function exists in `src/services/productService.ts` that
   accepts the filtered product array and the `sort` query value, applies the correct
   comparator for `price_asc`, `price_desc`, `name_asc`, and `name_desc`, returns a new
   sorted array, and does not mutate its input.
   - Verified by: `grep -n 'function sortProducts' src/benchmark-backend/src/services/productService.ts` returns exactly one hit; `pnpm --filter benchmark-backend test` passes all four sort test cases.

3. `getAllProducts` contains no inlined filtering or sorting logic — it only calls
   `filterProducts` and `sortProducts` (plus the fetch and pagination steps).
   - Verified by: `grep -n 'filterProducts\|sortProducts' src/benchmark-backend/src/services/productService.ts` shows both function calls appear inside `getAllProducts`; the body of `getAllProducts` contains no `result.filter(` or `result.sort(` calls directly (all such calls live inside the two helpers).

4. The `sanitizeSearch` export is removed entirely from `productService.ts`.
   - Verified by: `grep -n 'sanitizeSearch' src/benchmark-backend/src/services/productService.ts` produces no output (exit code 1 / empty).

5. The `DEFAULT_LIMIT` constant is removed entirely from `productService.ts`.
   - Verified by: `grep -n 'DEFAULT_LIMIT' src/benchmark-backend/src/services/productService.ts` produces no output (exit code 1 / empty).

6. No `=== true`, `=== false`, or redundant `!== undefined` boolean checks remain in
   `productService.ts`. The inStock filter uses a single idiomatic comparison
   (`p.inStock === query.inStock`) after the undefined guard, or an equivalent concise
   form with no explicit `=== true` / `=== false`.
   - Verified by: `grep -n '=== true\|=== false' src/benchmark-backend/src/services/productService.ts` produces no output; manual inspection of `filterProducts` confirms it does not contain an `if (inStock === true)` / `else` structure.

7. All existing backend tests pass without modification to any test file.
   - Verified by: `pnpm --filter benchmark-backend test` exits with code 0 and reports no failing test cases across all three describe blocks (`GET /products`, `Pagination`, `Auth middleware`).

8. The response envelope shape returned by `getAllProducts` is unchanged: an object with
   exactly the fields `data`, `total`, `page`, `limit`, and `totalPages`.
   - Verified by: `pnpm --filter benchmark-backend test` passes the "returns correct envelope shape for first page" pagination test, which asserts all five fields by name and value.

## Edge cases

- `inStock = false` (filter for out-of-stock): covered by requirement 1 and 7 — the `filterProducts` helper must retain this case; the test "filters out-of-stock products" exercises it.
- `inStock` not provided (no filter applied): covered by requirement 1 — `filterProducts` must skip inStock filtering entirely when `query.inStock` is `undefined`.
- Sort with unknown value (e.g. no `sort` param): covered by requirement 2 and 7 — `sortProducts` must return the array unchanged; all tests that omit `sort` still pass.
- Search is case-insensitive: covered by requirement 1 — the helper must lowercase both the term and the product name before comparing.
- Category is case-insensitive: covered by requirement 1 — the helper must lowercase both sides before comparing.
- `filterProducts` and `sortProducts` must not mutate the input array: covered by requirements 1 and 2 — the framework mandates pure functions; any in-place sort would be a defect detectable by running the full test suite multiple times (shared mock data would accumulate mutations).
