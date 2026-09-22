# Requirements

1. `totalPages` must equal `Math.ceil(total / limit)` — not `Math.floor`.
   - Verified by: `src/benchmark-backend/src/tests/visible/pagination.test.ts` — test "returns totalPages: 2 for 15 products with limit 10" passes (15 ÷ 10 = 1.5 → must ceil to 2; current floor gives 1, causing a test failure).

2. The `total` field in the paginated response must reflect the count of products matching all active query filters, not the total catalogue size.
   - Verified by: `GET /products?category=electronics&limit=10` (authenticated) returns `total: 4`, not `total: 15`. Observable by running the server and making the request, or by hidden tests checking filter-aware totals.

3. The `featured` filter must be enforced in the SQL `WHERE` clause before `LIMIT`/`OFFSET` is applied — not in JavaScript after paginated rows are returned.
   - Verified by: `GET /products?featured=true&limit=3` (authenticated) returns exactly 3 items in `data` and every item has `featured: true`. Under the buggy implementation a `LIMIT 3` slice is fetched first and then JS-filtered, so the page will often contain fewer than 3 featured products even when enough exist in the catalogue.

4. All visible tests in `src/benchmark-backend/src/tests/visible/` pass without modification.
   - Verified by: `pnpm test` inside `src/benchmark-backend/` exits with code 0 and no failing test cases.

5. Only `src/services/productService.ts` is modified; no test files, controller files, route files, or migration SQL files are changed.
   - Verified by: `git diff --name-only` shows only `src/benchmark-backend/src/services/productService.ts`.

---

## Edge cases

- **Exact division (15 products, limit 5):** `totalPages` must be 3, not 2 or 4. `Math.ceil(15 / 5) = 3`; covered by requirement 1 (pagination.test.ts "returns totalPages: 3 for 15 products with limit 5").
- **No active filters:** `total` must still equal the full catalogue count (15); the COUNT fix must not break the unfiltered case. Covered by requirement 4 (products.test.ts "returns all products with pagination envelope" asserts `total: 15`).
- **`featured=false` filter:** must also be applied in SQL, not JS, so out-of-featured products are correctly excluded from the count and from paginated slices. Covered by requirement 3 (the fix adds `featured` to the WHERE conditions array for any defined value of `query.featured`).
- **`inStock=true` with limit 6 (11 matching products):** `totalPages` must be `Math.ceil(11 / 6) = 2`. Covered by requirements 1 and 2 together (ceil formula + filter-aware COUNT).
