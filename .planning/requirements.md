# Requirements

1. `GET /products?limit=10` (no active filters, 15 total products) returns `totalPages: 2`.
   - Verified by: `pagination.test.ts` → "returns totalPages: 2 for 15 products with limit 10" asserts `res.body.totalPages === 2`.

2. `GET /products?limit=5` (no active filters, 15 total products) returns `totalPages: 3`.
   - Verified by: `pagination.test.ts` → "returns totalPages: 3 for 15 products with limit 5" asserts `res.body.totalPages === 3`.

3. `GET /products?category=electronics&limit=10` returns `total: 4` (not 15) and `totalPages: 1`.
   - Verified by: `products.test.ts` → "filters by category" asserts `res.body.data.length === 4`; task10 success criterion asserts `total: 4`.

4. `GET /products?category=electronics&limit=50` returns `data.length: 4` with every item having `category === 'electronics'`.
   - Verified by: `products.test.ts` → "filters by category" asserts both count and category equality.

5. `GET /products?featured=true&limit=3` returns exactly 3 products, all with `featured: true`, and `total` reflects only featured products.
   - Verified by: task10 success criterion; the `featured` SQL WHERE condition must be present so the COUNT and data queries operate on the same filtered set.

6. `GET /products?inStock=true&limit=50` returns `data.length: 11` with every item having `inStock: true`.
   - Verified by: `products.test.ts` → "filters in-stock products" asserts count (11) and that every product has `inStock === true`.

7. `GET /products?inStock=true&limit=6` returns `totalPages: 2` (11 in-stock products / 6 = 1.833 → rounds up to 2).
   - Verified by: task10 success criterion asserts `totalPages: 2`.

8. `GET /products?category=nonexistent&limit=50` returns `data: []` and `total: 0`.
   - Verified by: `products.test.ts` → "returns empty array for unknown category" asserts `res.body.data` equals `[]`.

9. `GET /products?page=1&limit=5` returns envelope `{ total: 15, page: 1, limit: 5, totalPages: 3, data.length: 5 }`.
   - Verified by: `products.test.ts` → "returns correct envelope shape for first page" asserts all five fields.

10. All four filters (`search`, `category`, `inStock`, `featured`) are enforced inside the SQL `WHERE` clause — none are applied in JavaScript after rows are fetched.
    - Verified by: requirements 3–7 above; if `featured` is still applied post-pagination, `GET /products?featured=true&limit=3` will return fewer than 3 results because it filters an already-paginated 3-row slice, causing test failure.

11. The COUNT query used to derive `total` applies the same `WHERE` conditions as the data query.
    - Verified by: requirements 3, 5, 7, 8 — each asserts a `total` value equal to the filtered count, not 15; any mismatch fails those assertions.

12. `totalPages` is computed with `Math.ceil(total / limit)`, not `Math.floor`.
    - Verified by: requirements 1 and 7 — `Math.floor(15/10) = 1` fails requirement 1; `Math.floor(11/6) = 1` fails requirement 7.

13. All changes are confined to `src/benchmark-backend/src/services/productService.ts`; no other source or test file is modified.
    - Verified by: `git diff --name-only` after the fix lists only `productService.ts`.

---

## Edge cases

- `totalPages` when `total` is exactly divisible by `limit` (e.g. 15 / 5 = 3): `Math.ceil` returns 3 — no off-by-one; covered by requirement 2.
- `totalPages` when `total` is NOT divisible by `limit` (e.g. 15 / 10 = 1.5): `Math.ceil` returns 2; covered by requirement 1.
- `totalPages` when `total` is 0 (no results match the filter): `Math.ceil(0 / limit) = 0`; covered by requirement 8.
- `featured` filter combined with a `limit` smaller than the total featured count: filter must be in SQL so the full filtered set is paginated, not a pre-paginated slice; covered by requirement 5 and 10.
- No active filters: `total` and `totalPages` continue to reflect the full catalogue (15 products); covered by requirements 1, 2, 9.
