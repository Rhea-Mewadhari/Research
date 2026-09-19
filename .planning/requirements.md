# Requirements

1. `src/data/products.ts` must set `featured: true` on exactly the products with ids 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), and 14 (Clean Code). All other product entries must not have `featured: true` (either the field is absent or set to `false`).
   - Verified by: `GET /products?featured=true&limit=50` returns `res.body.data.length === 4` and every item has `featured === true` (test: `products.test.ts` — "Featured filter / returns only featured products when featured=true").

2. `src/utils/queryParser.ts` must parse the `featured` query param: the string `'true'` maps to `query.featured = true`, the string `'false'` maps to `query.featured = false`, and any other value (including absence) leaves `query.featured` undefined.
   - Verified by: `GET /products?featured=false&limit=50` returns 11 products (test: "Featured filter / returns only non-featured products when featured=false"); absence of `featured` param returns all 15 products (test: "GET /products / returns all products with pagination envelope").

3. `src/utils/queryParser.ts` must include `'rating_desc'` in its `VALID_SORT_OPTIONS` array so that `sort=rating_desc` is accepted and forwarded to the service rather than silently dropped.
   - Verified by: `GET /products?sort=rating_desc&limit=50` returns a ratings array equal to itself sorted descending (test: "Rating sort / sorts by rating descending when sort=rating_desc").

4. `src/services/productService.ts` must apply a featured filter when `query.featured !== undefined`: keep only products where `(p.featured ?? false) === query.featured`. The filter must compose with existing filters (search, category, inStock).
   - Verified by: (a) `featured=true` returns exactly 4 products (test: "Featured filter / returns only featured products when featured=true"); (b) `featured=false` returns exactly 11 products (test: "Featured filter / returns only non-featured products when featured=false"); (c) `featured=true&category=electronics` returns exactly 1 product with `id === 1` (test: "Featured filter / featured=true combined with category filter returns intersection").

5. `src/services/productService.ts` must sort by `rating` descending (highest first) when `query.sort === 'rating_desc'`, without mutating the source array.
   - Verified by: `GET /products?sort=rating_desc&limit=50` returns ratings in non-increasing order: `ratings` deep-equals `[...ratings].sort((a, b) => b - a)` (test: "Rating sort / sorts by rating descending when sort=rating_desc").

6. All existing test suites must continue to pass without modification to any test file.
   - Verified by: `pnpm test` in `src/benchmark-backend` exits with code 0 and reports zero failures across "GET /products", "Pagination", and "Auth middleware" describe blocks.

## Edge cases

- Products with no `featured` field (ids 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 15): covered by requirement 4 — `(p.featured ?? false) === false` evaluates to `true` for these products, so they appear in `featured=false` results and are excluded from `featured=true` results.
- `featured` param with an unrecognised value (e.g., `featured=maybe`): covered by requirement 2 — only the exact strings `'true'` and `'false'` are parsed; anything else leaves `query.featured` undefined, so no featured filter is applied.
- `rating_desc` combined with other filters: covered by requirements 4 and 5 — filter is applied before sort, so the sort operates on the already-filtered result set.
- Array mutation guard for `rating_desc` sort: covered by requirement 5 — the sort must use `[...result].sort(...)` not `result.sort(...)`, consistent with the existing sort branches in the service.
