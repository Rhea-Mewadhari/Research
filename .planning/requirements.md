# Requirements

1. `GET /products?sort=price-asc` returns HTTP 200 with all products sorted so that each
   element's `price` is ≤ the next element's `price` (i.e. `prices` equals
   `[...prices].sort((a,b)=>a-b)`).
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` →
     "sorts by price ascending (frontend format)"

2. `GET /products?sort=price-desc` returns HTTP 200 with all products sorted so that each
   element's `price` is ≥ the next element's `price` (i.e. `prices` equals
   `[...prices].sort((a,b)=>b-a)`).
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` →
     "sorts by price descending (frontend format)"

3. `GET /products?sort=rating-desc` returns HTTP 200 with all products sorted so that each
   element's `rating` is ≥ the next element's `rating` (i.e. `ratings` equals
   `[...ratings].sort((a,b)=>b-a)`).
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` →
     "sorts by rating descending (frontend format)"

4. The response envelope from `GET /products` contains the field `total` whose value equals
   the total number of matching products before pagination is applied.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` →
     "returns all products with pagination envelope" (`res.body.total === 15`) and
     "response envelope contains total and totalPages" (`res.body.total === 15`)

5. The response envelope from `GET /products` contains the field `totalPages` whose value
   equals `Math.ceil(total / limit)`.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` →
     "response envelope contains total and totalPages" (`res.body.totalPages === 3` with
     15 products and `limit=5`)

6. The response envelope does NOT contain the fields `count` or `pages`; only `total` and
   `totalPages` are used for those values.
   - Verified by: `pnpm --filter benchmark-backend test` passes all pagination envelope
     tests; none of the test assertions reference `count` or `pages`, and any property
     check for `total`/`totalPages` would fail if the old names were retained alongside.

7. All existing filters continue to work after the sort and envelope changes:
   - `category` filter: `GET /products?category=electronics` returns exactly the products
     whose `category === 'electronics'` (4 products in the fixture).
   - `inStock` filter: `GET /products?inStock=true` returns exactly the products where
     `inStock === true` (11 products in the fixture).
   - `search` filter: `GET /products?search=laptop` returns only products whose `name`
     contains "laptop" (case-insensitive); `?search=xyznonexistent` returns `data: []`.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` →
     "filters by category", "returns empty array for unknown category",
     "filters in-stock products", "filters by search term",
     "returns empty data array when search matches nothing"

8. Pagination fields `page`, `limit`, and `data` remain correct and unchanged:
   - `page=1&limit=5` returns `data.length === 5`, `page === 1`, `limit === 5`.
   - Page 2 returns a different set of 5 products from page 1.
   - `limit=100` is clamped to `50`.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` →
     "returns correct envelope shape for first page", "returns a different set of products
     for page 2", "clamps limit to a maximum of 50"

9. Auth middleware is unmodified and continues to enforce its rules:
   - No `Authorization` header → HTTP 401.
   - Token whose digits sum to an odd number → HTTP 401 with `{ error: 'Unauthorized' }`.
   - Token whose digits sum to an even number → HTTP 200.
   - No `Bearer` prefix → HTTP 401.
   - `GET /health` requires no auth → HTTP 200 with `{ status: 'ok' }`.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` →
     all tests in the "Auth middleware" describe block.

10. Only `src/benchmark-backend/src/utils/queryParser.ts` and
    `src/benchmark-backend/src/services/productService.ts` are modified. No test files,
    no auth files, no `Product` type shape are changed.
    - Verified by: `git diff --name-only` after implementing shows only the two permitted
      files.

## Edge cases

- Unknown sort values (e.g. `sort=foo`, `sort=priceAsc` camelCase sent by a legacy
  client): silently ignored — no sort is applied, and no error is returned. Covered by
  requirement 1–3 (the parser must not accept camelCase as valid after the change, but
  must still return a usable query object without a `sort` field).
- `sort` parameter absent: no sorting applied, products returned in their natural data
  order. Covered by requirements 7 and 8.
- `nameAsc` / `nameDesc` internal sort values: these are not exposed via the frontend
  hyphenated format but must remain reachable through existing internal representation if
  already present. Covered by requirement 10 (no regression in untouched code paths).
- Pagination with 0 results (e.g. unknown category): `total === 0`, `totalPages === 0`,
  `data === []`. Covered by requirement 4 and 5 (the formula `Math.ceil(0/limit) === 0`).
