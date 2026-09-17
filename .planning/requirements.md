# Requirements

1. `GET /products?sort=price-asc` returns all products sorted by price in ascending order (lowest first).
   - Verified by: visible test `"sorts by price ascending (frontend format)"` in `products.test.ts` — asserts that `res.body.data.map(p => p.price)` equals its own ascending sort.

2. `GET /products?sort=price-desc` returns all products sorted by price in descending order (highest first).
   - Verified by: visible test `"sorts by price descending (frontend format)"` in `products.test.ts` — asserts that prices equal their own descending sort.

3. `GET /products?sort=rating-desc` returns all products sorted by rating in descending order (highest first).
   - Verified by: visible test `"sorts by rating descending (frontend format)"` in `products.test.ts` — asserts that ratings equal their own descending sort.

4. The response envelope field for total matching product count is named `total` (not `count`).
   - Verified by: visible test `"returns all products with pagination envelope"` asserts `res.body.total === 15`; test `"response envelope contains total and totalPages"` asserts `res.body` has property `total` and `res.body.total === 15`.

5. The response envelope field for total page count is named `totalPages` (not `pages`).
   - Verified by: visible test `"response envelope contains total and totalPages"` asserts `res.body` has property `totalPages` and `res.body.totalPages === 3` (for `limit=5` over 15 products).

6. Only `src/utils/queryParser.ts` and `src/services/productService.ts` are modified; no test files or other source files are changed.
   - Verified by: `git diff --name-only` after changes lists exactly those two files (plus no file under `src/tests/`).

7. Existing filter behaviour is preserved: `category`, `search`, and `inStock` filters continue to return the same results as before.
   - Verified by: visible tests `"filters by category"` (4 electronics), `"returns empty array for unknown category"`, `"filters in-stock products"` (11 items), `"filters by search term"`, and `"returns empty data array when search matches nothing"` all pass.

8. Pagination continues to work correctly: `page` and `limit` (capped at 50) are still respected and returned in the envelope.
   - Verified by: visible tests `"returns correct envelope shape for first page"`, `"returns a different set of products for page 2"`, and `"clamps limit to a maximum of 50"` all pass.

9. Auth middleware behaviour is unchanged: requests without a valid Bearer token receive HTTP 401 with `{"error":"Unauthorized"}`; `/health` requires no auth.
   - Verified by: visible tests in `"Auth middleware"` describe block and `"returns 401 without auth header"` all pass.

10. All 18 visible tests in `src/benchmark-backend/src/tests/visible/products.test.ts` pass with exit code 0.
    - Verified by: running `pnpm --filter benchmark-backend test` produces no failed test suites and the process exits with code 0.

## Edge cases

- Unrecognised sort values (e.g. `?sort=invalid`, `?sort=priceAsc` in camelCase sent by a non-frontend client): silently dropped — no sort is applied, products are returned in their default order. Covered by requirement 7 (filters unaffected) and requirement 10 (overall test suite).
- `nameAsc` / `nameDesc` camelCase sort values: still accepted (backward-compatibility). Covered by requirement 6 (no broad rewrites) and requirement 10.
- `limit` exceeding 50: clamped to 50. Covered by requirement 8.
- `page` or `limit` as non-numeric or zero: ignored, defaults apply. Covered by requirement 10.
- `inStock=false` filter: returns out-of-stock products only. Covered by requirement 7 (existing filters preserved) and requirement 10.
