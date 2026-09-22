# Requirements

1. `GET /products` with a `category` filter must return `total` equal to the count of products matching that category, not the full catalogue count.
   - Verified by: `GET /products?category=electronics&limit=10` returns a JSON body where `total === 4`. Currently returns `total: 15` (the full catalogue).

2. `GET /products` with an `inStock` filter must return `total` equal to the count of products matching the stock status.
   - Verified by: pagination.test.ts (`returns totalPages: 2 for 15 products with limit 10`) passes with `total: 15` on an unfiltered request, confirming the count query still includes unfiltered totals when no filter is active. Additionally `GET /products?inStock=true&limit=6` returns `total: 11` (the number of in-stock products, not 15).

3. `GET /products` with a `search` filter must return `total` equal to the count of products whose name matches the search term.
   - Verified by: `GET /products?search=laptop&limit=50` returns `total` matching only the products whose name contains "laptop", not 15.

4. The `featured` filter must be applied as a SQL `WHERE featured = ?` condition before pagination, not in JavaScript after the paginated slice is returned.
   - Verified by: `GET /products?featured=true&limit=3` returns exactly 3 items in `data`, all with `featured: true`, and `total` reflects the count of featured products in the database. The post-pagination JS filter block (`if (query.featured !== undefined) { data = data.filter(...) }`) must be removed from `productService.ts`.

5. `totalPages` must be computed as `Math.ceil(total / limit)` so that a non-zero remainder always adds one full page.
   - Verified by: pagination.test.ts `returns totalPages: 2 for 15 products with limit 10` passes (15 / 10 = 1.5 → ceil → 2). Also `GET /products?inStock=true&limit=6` returns `totalPages: 2` (11 in-stock / 6 = 1.833 → ceil → 2).

6. Exact-division pagination must remain correct: when `total` is evenly divisible by `limit`, `totalPages` equals the quotient with no extra page.
   - Verified by: pagination.test.ts `returns totalPages: 3 for 15 products with limit 5` passes (15 / 5 = 3.0 → ceil → 3).

7. Only `src/benchmark-backend/src/services/productService.ts` is modified; no other source file changes.
   - Verified by: `git diff --name-only` lists only `src/benchmark-backend/src/services/productService.ts`.

8. All visible tests pass after the fix.
   - Verified by: `pnpm test` run from `src/benchmark-backend/` exits with code 0 and reports 0 failing tests.

## Edge cases

- No active filters: `total` equals full catalogue count (15); covered by requirement 6 (unfiltered baseline in pagination.test.ts).
- `featured=false`: SQL `WHERE featured = 0` must be applied, not a JS `.filter(p => !p.featured)` on paginated rows; covered by requirement 4.
- Multiple filters combined (e.g. `category=electronics&inStock=true`): all conditions must appear in both the `COUNT(*)` WHERE and the main SELECT WHERE; covered by requirements 1 and 2.
- `total` exactly divisible by `limit` with active filters (e.g., 4 electronics / limit 2 = 2): `Math.ceil` gives the correct answer; covered by requirement 6.
- Page 2 beyond available data (e.g. 4 electronics, limit 10, page 2): `data` returns empty array while `total: 4` and `totalPages: 1` remain correct; covered by requirement 1.
