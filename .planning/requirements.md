# Requirements

1. Products with id 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), and 14 (Clean Code) must have `featured: true` set in `src/data/products.ts`. All other 11 products must not have `featured: true` (field omitted or explicitly `false`).
   - Verified by: `pnpm test` — the "Featured filter" suite's `featured=true` test asserts `res.body.data.length === 4` and every product has `featured === true`; the `featured=false` test asserts `res.body.data.length === 11` and every product has `!featured`. Both counts can only be correct if exactly these four ids are marked featured.

2. `GET /products?featured=true` returns HTTP 200 with exactly 4 products, each having `featured === true`.
   - Verified by: `pnpm test` — `products.test.ts:153–158` ("returns only featured products when featured=true")

3. `GET /products?featured=false` returns HTTP 200 with exactly 11 products, none having `featured === true`.
   - Verified by: `pnpm test` — `products.test.ts:160–165` ("returns only non-featured products when featured=false")

4. `GET /products?featured=true&category=electronics` returns HTTP 200 with exactly 1 product whose `id` is 1.
   - Verified by: `pnpm test` — `products.test.ts:167–175` ("featured=true combined with category filter returns intersection")

5. `GET /products?sort=rating_desc` returns HTTP 200 with products ordered so that the `rating` values form a non-increasing sequence (each rating ≥ the next).
   - Verified by: `pnpm test` — `products.test.ts:178–184` ("sorts by rating descending when sort=rating_desc"); the test checks `ratings` equals `[...ratings].sort((a, b) => b - a)`

6. `'rating_desc'` must be added to `VALID_SORT_OPTIONS` in `src/utils/queryParser.ts` so that a request with `sort=rating_desc` sets `query.sort` to `'rating_desc'` instead of silently dropping it.
   - Verified by: `pnpm test` — requirement 5's test can only pass if the sort value reaches the service layer; if it were silently dropped, the order would remain insertion order, not rating-descending order.

7. `featured=true` and `featured=false` in the query string must be parsed into `query.featured = true` and `query.featured = false` respectively in `src/utils/queryParser.ts`. Any other value (or absence of the param) must leave `query.featured` unset.
   - Verified by: `pnpm test` — requirements 2, 3, and 4 all depend on the parser correctly setting this boolean; the no-filter baseline test (all 15 products) confirms absence of the param leaves filtering off.

8. When `query.featured` is undefined (no `featured` param supplied), no featured filtering is applied and all products matching other active filters are returned.
   - Verified by: `pnpm test` — `products.test.ts:21–25` ("returns all products with pagination envelope") expects 15 products total with `?limit=50` and no featured param.

9. The sort logic in `src/services/productService.ts` must not mutate the `result` array in place; it must derive a new sorted array (e.g., `[...result].sort(...)`).
   - Verified by: `pnpm test` — all existing sort tests and the new rating_desc test pass; in-place mutation of a shared array would cause non-deterministic failures across consecutive test runs.

10. All pre-existing tests (GET /products baseline, category filter, inStock filter, search filter, pagination envelope, all existing sort options, and all auth middleware tests) continue to pass after the changes.
    - Verified by: `pnpm test` — the full test suite exits with zero failures.

## Edge cases

- `featured` param absent: no featured filtering applied → covered by requirement 8
- `featured=true` combined with `category=electronics`: only products that are both featured AND in the electronics category are returned (intersection, not union) → covered by requirement 4
- Products without a `featured` field at all: the filter expression `(p.featured ?? false) === query.featured` treats a missing field as `false`, so they are included in `featured=false` results and excluded from `featured=true` results → covered by requirements 2 and 3
- `sort=rating_desc` with no other filters: all 15 products are returned in rating-descending order → covered by requirement 5
- `rating_desc` must not break existing sorts (`price_asc`, `price_desc`, `name_asc`, `name_desc`); the parser change only adds to the allow-list and does not remove anything → covered by requirement 10
- Products sharing the same `rating` value: stable sort order between equal-rating products is not asserted; the test only checks the non-increasing property → covered by requirement 5
