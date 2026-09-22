# Requirements

1. `GET /products` with an active `category` filter must return a `total` that reflects
   only the matching products, not the full catalogue.
   - Verified by: `GET /products?category=electronics&limit=10` returns HTTP 200 with
     `total: 4` (the catalogue has 15 products; only 4 are in the electronics category).

2. `GET /products` with an active `inStock` filter must return a `total` that reflects
   only the matching products, not the full catalogue.
   - Verified by: `GET /products?inStock=true&limit=6` returns HTTP 200 with `total: 11`
     (11 products are in-stock in the seed data).

3. The `featured` filter must be enforced in the SQL `WHERE` clause, not in JavaScript
   after the paginated rows are returned.
   - Verified by: `GET /products?featured=true&limit=3` returns HTTP 200 with exactly 3
     items in `data`, all having `featured: true`. If the filter were applied post-pagination,
     the JS filter would operate on an already-sliced set and could return fewer than 3.

4. `GET /products` with an active `featured` filter must return a `total` that reflects
   only the matching (featured / non-featured) products.
   - Verified by: `GET /products?featured=true&limit=50` returns `total` equal to
     `data.length` (all featured products are returned and the count matches).

5. `totalPages` must be computed with ceiling division (`Math.ceil(total / limit)`) so
   that a partial last page is counted.
   - Verified by: `pnpm test` passes `src/tests/visible/pagination.test.ts`, which asserts
     `GET /products?limit=10` returns `totalPages: 2` for a 15-product catalogue
     (15 / 10 = 1.5 → ceil = 2, floor = 1).

6. `totalPages` must remain correct when the count is evenly divisible by the limit.
   - Verified by: `pnpm test` passes the assertion in `pagination.test.ts` that
     `GET /products?limit=5` returns `totalPages: 3` (15 / 5 = 3 exactly).

7. `GET /products?inStock=true&limit=6` must return `totalPages: 2`.
   - Verified by: HTTP response body contains `totalPages: 2` (11 in-stock products /
     6 per page = 1.83 → ceil = 2; floor would give 1).

8. All pre-existing visible tests must continue to pass with no regressions.
   - Verified by: `pnpm test` exits 0 inside `src/benchmark-backend` and all suites in
     `src/tests/visible/` (products.test.ts, pagination.test.ts, and others) are green.

9. Only `src/benchmark-backend/src/services/productService.ts` is modified.
   - Verified by: `git diff --name-only` lists exactly that file and nothing else.

## Edge cases

- `featured=false`: covered by requirement 3 — the SQL WHERE clause must handle both
  `featured=true` and `featured=false`, filtering to non-featured products in the latter case.
- Multiple simultaneous filters (e.g., `category=electronics&inStock=true`): covered by
  requirements 1 and 2 — the COUNT query must accumulate all active WHERE conditions,
  just as the data query already does.
- Count evenly divisible by limit: covered by requirement 6 — `Math.ceil` is identical
  to `Math.floor` for whole-number results, so no regression at even boundaries.
- No active filters: covered by requirement 8 — the unfiltered `total: 15` assertions
  in `products.test.ts` must still pass after the fix.
