# Requirements

1. A named filter helper function exists in `productService.ts` whose body contains
   the search, category, and inStock filtering logic. `getAllProducts` calls this
   function — it does not inline those conditions in its own body.
   - Verified by: Read `productService.ts` and confirm (a) a standalone function
     exists containing `.includes(term)`, category equality, and inStock conditions,
     and (b) `getAllProducts`'s body delegates to that function with a single call
     rather than repeating those conditions inline.

2. A named sort helper function exists in `productService.ts` whose body contains
   all four sort comparators (price_asc, price_desc, name_asc, name_desc).
   `getAllProducts` calls this function — it does not inline sort logic in its own
   body.
   - Verified by: Read `productService.ts` and confirm (a) a standalone function
     exists containing the price and name comparators, and (b) `getAllProducts`'s
     body contains no `localeCompare` or `a.price - b.price` expressions directly.

3. `getAllProducts` is a thin orchestrator: its body contains only the call to
   `fetchAllProducts`, the call to the filter helper, the call to the sort helper,
   pagination math (total, page, limit, totalPages, slice), and the return statement.
   No filter conditions or sort comparators appear inside `getAllProducts` itself.
   - Verified by: Read `productService.ts` and confirm `getAllProducts` contains none
     of: `.includes(`, `p.category`, `p.inStock`, `localeCompare`, `a.price`,
     `b.price` directly in its body.

4. `sanitizeSearch` is not exported from `productService.ts` — the function and its
   `export` keyword are both removed.
   - Verified by: `grep -n 'sanitizeSearch' src/benchmark-backend/src/services/productService.ts`
     returns no output.

5. No verbose boolean comparisons of the form `=== true` or `=== false` remain on
   boolean-typed fields in `productService.ts`.
   - Verified by: `grep -n '=== true\|=== false' src/benchmark-backend/src/services/productService.ts`
     returns no matches.

6. No `!== undefined` checks remain in `productService.ts`.
   - Verified by: `grep -n '!== undefined' src/benchmark-backend/src/services/productService.ts`
     returns no matches.

7. The sort helper does not mutate its input; it returns a new sorted array.
   - Verified by: Read the sort helper in `productService.ts` and confirm it spreads
     into a new array before calling `.sort()` (e.g. `[...products].sort(...)`)
     rather than sorting in place.

8. The filter helper does not mutate its input; it returns new arrays produced by
   `.filter()` chaining, never by in-place modification.
   - Verified by: Read the filter helper in `productService.ts` and confirm it uses
     only `.filter()` (which returns a new array) and never assigns back to the
     original argument.

9. All existing tests pass without any modification to test files.
   - Verified by: `pnpm --filter benchmark-backend test` exits with code 0 and every
     test case in `src/tests/visible/products.test.ts` is reported as passing.

10. The response envelope shape is unchanged: `getAllProducts` still returns a
    `PaginatedResponse<Product>` with exactly the fields `data`, `total`, `page`,
    `limit`, `totalPages`, computed identically to the original implementation.
    - Verified by: The Pagination describe block in `products.test.ts` passes,
      specifically "returns correct envelope shape for first page" which asserts all
      five fields with exact values.

## Edge cases

- `inStock=false` (out-of-stock): covered by requirement 9 ("filters out-of-stock
  products" test asserts `every(p => !p.inStock)`).
- No sort param supplied: covered by requirement 9 ("returns all products" test
  passes, confirming unsorted default is preserved).
- Search term that matches nothing: covered by requirement 9 ("returns empty data
  array when search matches nothing" test).
- Category that matches nothing: covered by requirement 9 ("returns empty array for
  unknown category" test).
- No query params at all: covered by requirement 9 ("returns all products" test with
  only `limit=50`).
- Sort with combined filter: indirectly covered by requirement 9 (all filter + sort
  tests run against the same service path).
- `sort` value not in `SortOption` union: the helper must return the input array
  unchanged when `sort` is `undefined`; covered by requirement 9 (unsorted tests
  still return correct order).
