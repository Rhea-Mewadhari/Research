# Requirements

1. A function named `filterProducts` must exist in `productService.ts` and must contain the filtering logic for `search`, `category`, and `inStock` (that logic must not remain inlined in `getAllProducts`).
   - Verified by: `grep -n 'function filterProducts' src/benchmark-backend/src/services/productService.ts` returns at least one match; `grep -n 'filterProducts' src/benchmark-backend/src/services/productService.ts` is called from within `getAllProducts`.

2. A function named `sortProducts` must exist in `productService.ts` and must contain the sort comparator logic for all four sort options (that logic must not remain inlined in `getAllProducts`).
   - Verified by: `grep -n 'function sortProducts' src/benchmark-backend/src/services/productService.ts` returns at least one match; `grep -n 'sortProducts' src/benchmark-backend/src/services/productService.ts` is called from within `getAllProducts`.

3. `getAllProducts` must be a thin orchestrator: its body must only call `fetchAllProducts`, `filterProducts`, `sortProducts`, perform the pagination slice, and return the envelope — no filter or sort logic may be inlined.
   - Verified by: Reading `getAllProducts` in `productService.ts` confirms it contains no `Array.prototype.filter` or `.sort` calls directly; all such calls are delegated to the helpers.

4. The `sanitizeSearch` export must be removed from `productService.ts`.
   - Verified by: `grep -n 'sanitizeSearch' src/benchmark-backend/src/services/productService.ts` returns no matches.

5. No redundant `=== true` or `=== false` boolean comparisons against `p.inStock` may remain; idiomatic alternatives (`p.inStock`, `!p.inStock`, or `p.inStock === query.inStock`) must be used instead.
   - Verified by: `grep -n 'p\.inStock === true\|p\.inStock === false' src/benchmark-backend/src/services/productService.ts` returns no matches.

6. The sort logic in `sortProducts` must use a consistent conditional structure — a single `if / else if / else if / else if` chain (or equivalent) rather than four independent `if` blocks.
   - Verified by: Reading `sortProducts` in `productService.ts` confirms that after the first branch (`if (sort === 'price_asc')`), each subsequent sort branch starts with `else if`, so at most one branch executes per call.

7. All tests in `src/benchmark-backend/src/tests/visible/products.test.ts` must continue to pass without modification.
   - Verified by: `pnpm --filter benchmark-backend test` exits with code 0 and the output shows all test suites green.

8. Only `src/benchmark-backend/src/services/productService.ts` may be modified; no other file may be changed.
   - Verified by: `git diff --name-only` lists only `src/benchmark-backend/src/services/productService.ts`.

## Edge cases

- `inStock` is a three-valued optional (`undefined` | `true` | `false`): a truthy check `if (query.inStock)` would skip the `false` case, so the presence check must remain `!== undefined`. Covered by requirement 7 (the "filters out-of-stock products" test).
- An unknown `sort` value not in `SortOption` must leave the array unmodified: the `else if` chain has no matching branch, so the original order is preserved. Covered by requirement 6 (consistent structure) and requirement 7 (no regression).
- Empty search string (`query.search = ''`): no visible test covers this case — behaviour is not required to change, so both `!== undefined` and a truthy check are acceptable. Covered by requirement 7 (existing test suite must pass).
- `filterProducts` and `sortProducts` must not mutate their input arrays; they must derive new arrays (e.g., `input.filter(...)` returns a new array; `.sort` calls must operate on a copy `[...input].sort(...)`). Covered by requirement 7 (test suite uses a shared mock array across tests).
