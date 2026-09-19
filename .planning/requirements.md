# Requirements

1. In `src/benchmark-backend/src/data/products.ts`, exactly four products have `featured: true`: id 1 (Laptop), id 8 (Ergonomic Chair), id 11 (Yoga Mat), id 14 (Clean Code). All remaining 11 products either omit `featured` or set it to `false`.
   - Verified by: `GET /products?featured=true&limit=50` in `products.test.ts` (Featured filter suite) returns `res.body.data.length === 4` and every item has `p.featured === true`; `GET /products?featured=false&limit=50` returns `res.body.data.length === 11`.

2. In `src/benchmark-backend/src/utils/queryParser.ts`, the query string value `featured=true` is parsed into `query.featured = true` (boolean), and `featured=false` is parsed into `query.featured = false` (boolean). When `featured` is absent the field is not set.
   - Verified by: the Featured filter tests in `products.test.ts` pass — a missing parse would cause the service to ignore the param and return all 15 products instead of 4 or 11.

3. In `src/benchmark-backend/src/utils/queryParser.ts`, `'rating_desc'` is accepted as a valid sort option (not silently dropped).
   - Verified by: the Rating sort test in `products.test.ts` (`sort=rating_desc`) reaches the service and returns products sorted by rating descending; if the parser dropped the value the sort would not be applied and the order assertion would fail.

4. In `src/benchmark-backend/src/services/productService.ts`, when `query.featured` is defined, products are filtered using `(p.featured ?? false) === query.featured`.
   - Verified by: `GET /products?featured=true&limit=50` returns exactly 4 items; `GET /products?featured=false&limit=50` returns exactly 11 items; `GET /products?featured=true&category=electronics&limit=50` returns exactly 1 item with `id === 1` (intersection of featured and electronics).

5. In `src/benchmark-backend/src/services/productService.ts`, when `query.sort === 'rating_desc'`, products are sorted by their `rating` field highest-first.
   - Verified by: `GET /products?sort=rating_desc&limit=50` returns `res.body.data` where `ratings` equals `[...ratings].sort((a, b) => b - a)` (Rating sort suite in `products.test.ts`).

6. `src/benchmark-backend/src/types/product.ts` is not modified (the `Product` interface and `SortOption` type are left exactly as found).
   - Verified by: `git diff HEAD -- src/benchmark-backend/src/types/product.ts` produces no output after all changes are made.

7. All pre-existing test suites (`GET /products`, `Pagination`, `Auth middleware`) continue to pass unchanged — total product count remains 15, pagination maths correct, auth rules unchanged.
   - Verified by: `pnpm test` exits 0 with no failures in any suite in `src/benchmark-backend/src/tests/visible/products.test.ts`.

## Edge cases

- Products without a `featured` field must be treated as `featured: false` in filter logic (`p.featured ?? false`): covered by requirement 4.
- `featured=true` combined with a category filter must return the intersection, not a union: covered by requirement 4 (the third assertion).
- Absence of `featured` in the query string must not alter behaviour of unrelated filters or sorts: covered by requirement 7 (all existing tests still pass).
- `rating_desc` sort must not break any existing sort option (`price_asc`, `price_desc`, `name_asc`, `name_desc`): covered by requirement 7.
