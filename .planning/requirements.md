# Requirements

1. `GET /products?category=electronics&limit=10` returns a JSON body where `total` equals `4` and `totalPages` equals `1`.
   - Verified by: running `pnpm test` in `src/benchmark-backend/` (products.test.ts "filters by category" asserts `data.length === 4`); additionally confirmed by the task success criterion that `total: 4` is returned for this request (not the full-catalogue count of 15).

2. The SQL COUNT query used to compute `total` must include the same WHERE conditions as the data SELECT query — i.e. active filters (`search`, `category`, `inStock`, `featured`) must be present in the COUNT query's WHERE clause.
   - Verified by: code inspection of `src/benchmark-backend/src/services/productService.ts` — the `SELECT COUNT(*)` statement must be parameterised with the same `conditions` array and `params` as the data query, not a bare `SELECT COUNT(*) FROM products`.

3. The `featured` filter must be applied inside the SQL WHERE clause, not in JavaScript after the database returns rows. Specifically, `GET /products?featured=true&limit=3` must return exactly 3 products in `data`, all having `featured: true`.
   - Verified by: running `pnpm test` (pagination.test.ts passes); and code inspection of `productService.ts` — there must be no post-query JavaScript `.filter()` on `featured`, and the SQL `WHERE` must include a `featured = ?` condition when `query.featured !== undefined`.

4. `GET /products?inStock=true&limit=6` returns `totalPages: 2` (11 in-stock products / 6 per page = 1.833… → ceiling = 2).
   - Verified by: running `pnpm test` in `src/benchmark-backend/` (the task success criterion); the response JSON must contain `{ totalPages: 2 }` for this request.

5. `GET /products?limit=10` (all 15 products, no filter) returns `total: 15` and `totalPages: 2` (ceiling of 15/10 = 2).
   - Verified by: running `pnpm test` — pagination.test.ts "returns totalPages: 2 for 15 products with limit 10" asserts exactly this.

6. `GET /products?limit=5` (all 15 products) returns `totalPages: 3` (15/5 = 3.0 exactly, ceiling = 3).
   - Verified by: running `pnpm test` — pagination.test.ts "returns totalPages: 3 for 15 products with limit 5" and products.test.ts Pagination suite assert this.

7. All previously passing visible tests continue to pass — no regressions in unfiltered listing, sorting, search, inStock filter, pagination envelope shape, or auth middleware behaviour.
   - Verified by: `pnpm test` exits with zero failures across all describe blocks in `products.test.ts` and `pagination.test.ts`.

8. Only `src/services/productService.ts` is modified — no changes to controllers, route files, query parser, migration SQL, or test files.
   - Verified by: `git diff --name-only` lists only `src/benchmark-backend/src/services/productService.ts`.

## Edge cases

- **Exact division** (e.g. 15 products, limit=5): ceiling(15/5) = 3, same as floor — covered by requirement 6. Formula change must not break the evenly-divisible case.
- **Single page** (filtered result fits in one page, e.g. `category=electronics` with limit=10 → 4 results): `totalPages` must be 1, not 0 — covered by requirement 1 (ceiling(4/10) = 1).
- **`featured` + pagination**: with `featured=true` and `limit=3`, all 3 returned items must be featured — possible only if the SQL WHERE is applied before LIMIT/OFFSET; covered by requirement 3.
- **`inStock=false`** filter: must use SQL `in_stock = 0` condition; `total` must reflect only out-of-stock count; covered implicitly by requirements 2 and 7 (products.test.ts "filters out-of-stock products").
- **Combined filters**: `total` and `totalPages` must reflect the intersection of all active filters — covered by requirement 2 (same WHERE applies to COUNT and SELECT).
- **No filter active**: COUNT(*) without WHERE is correct behaviour and must be preserved — covered by requirements 5, 6, 7.
