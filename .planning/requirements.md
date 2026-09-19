# Requirements

1. Products with id 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), and 14 (Clean Code) in `src/benchmark-backend/src/data/products.ts` have `featured: true` set. The remaining 11 products either omit the field or have `featured: false`.
   - Verified by: `pnpm test` in `src/benchmark-backend`; the "Featured filter" suite test at line 157 asserts `res.body.data.length === 4` and `res.body.data.every(p => p.featured === true)` when `featured=true&limit=50` is requested; the test at line 163 asserts `res.body.data.length === 11` when `featured=false&limit=50` is requested.

2. `'rating_desc'` is added to `VALID_SORT_OPTIONS` in `src/benchmark-backend/src/utils/queryParser.ts` so that `parseProductQuery({ sort: 'rating_desc' })` produces a `ProductQuery` with `sort === 'rating_desc'` (i.e., the value is not silently dropped).
   - Verified by: `pnpm test`; the "Rating sort" suite test at line 178 sends `GET /products?sort=rating_desc&limit=50` and receives a 200 response with a sorted ratings array — only possible if the sort value passes through the parser.

3. `parseProductQuery` in `src/benchmark-backend/src/utils/queryParser.ts` sets `query.featured = true` when the raw param is the string `'true'`, sets `query.featured = false` when the raw param is the string `'false'`, and leaves `query.featured` undefined for any other value (including absent).
   - Verified by: `pnpm test`; the "Featured filter" HTTP tests at lines 153–175 confirm correct counts and field values are returned — these are only correct if the parser sets `query.featured` appropriately and does not set it for invalid/absent values.

4. `getAllProducts` in `src/benchmark-backend/src/services/productService.ts` applies a featured filter when `query.featured` is defined: keeps only products where `(p.featured ?? false) === query.featured`. When `query.featured` is `undefined`, no featured filter is applied and all products pass through.
   - Verified by: `pnpm test`; the "Featured filter" tests at lines 153–175 check three scenarios:
     - `featured=true` → 4 products, all with `p.featured === true`
     - `featured=false` → 11 products, all with `!p.featured` (falsy featured)
     - `featured=true&category=electronics` → 1 product with id 1 (intersection of featured and electronics category)

5. `getAllProducts` in `src/benchmark-backend/src/services/productService.ts` sorts results by `rating` descending when `query.sort === 'rating_desc'`, without mutating the source array (sort is applied on a derived copy).
   - Verified by: `pnpm test`; the "Rating sort" test at lines 178–183 maps ratings from the response and asserts `ratings` equals `[...ratings].sort((a, b) => b - a)` — confirming highest-rating-first order across all 15 products.

6. All pre-existing test suites ("GET /products", "Pagination", "Auth middleware") pass without modification after changes are made to the three target files.
   - Verified by: `pnpm test` in `src/benchmark-backend` exits with zero failures across all suites, including the 11 "GET /products" tests, 3 "Pagination" tests, and 4 "Auth middleware" tests.

## Edge cases

- `featured` query param absent: no featured filter applied; all 15 products returned (subject to other filters/pagination) — covered by requirement 4 (`query.featured` undefined → no filter branch entered).
- `featured` param with an invalid value (e.g., `featured=yes`, `featured=1`): `query.featured` is not set; no filter applied — covered by requirement 3 (only exact strings `'true'`/`'false'` are accepted).
- Products whose `featured` field is omitted are treated as `false` via `?? false` nullish coalescing in the filter expression — covered by requirement 4.
- `sort=rating_desc` combined with other active filters (e.g., `category`, `inStock`): sort is applied to the already-filtered result set — covered by requirement 5 (service applies sort after all filters in the existing composition order).
- Source `products` array is not mutated by the rating sort: requirement 5 mandates a copy is sorted (`[...result].sort(...)` pattern consistent with existing sort branches in the service).
- `src/types/product.ts` is not modified: the `Product` interface already includes `featured?: boolean` and `SortOption` already includes `'rating_desc'` — do not touch this file.
