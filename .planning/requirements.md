# Requirements

1. `GET /products?sort=price-asc` (with a valid auth header) returns HTTP 200 and a `data` array whose `price` values are sorted ascending (each element's price ≥ the previous element's price).
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` — "sorts by price ascending (frontend format)" — checks `prices` array equals its own sorted copy ascending.

2. `GET /products?sort=price-desc` (with a valid auth header) returns HTTP 200 and a `data` array whose `price` values are sorted descending (each element's price ≤ the previous element's price).
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` — "sorts by price descending (frontend format)" — checks `prices` array equals its own sorted copy descending.

3. `GET /products?sort=rating-desc` (with a valid auth header) returns HTTP 200 and a `data` array whose `rating` values are sorted descending (each element's rating ≤ the previous element's rating).
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` — "sorts by rating descending (frontend format)" — checks `ratings` array equals its own sorted copy descending.

4. Every `GET /products` response envelope includes a `total` field (integer) equal to the total count of products matching the current filters (before pagination), and a `totalPages` field (integer) equal to `Math.ceil(total / limit)`.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` — "response envelope contains total and totalPages" — asserts `res.body.total === 15` and `res.body.totalPages === 3` for `?page=1&limit=5` against the 15-product mock dataset; and "returns all products with pagination envelope" — asserts `res.body.total === 15`.

5. The response envelope must NOT use the old field names `count` or `pages` in place of `total` and `totalPages`. The `page` and `limit` fields remain unchanged in the envelope.
   - Verified by: running `pnpm test` in `src/benchmark-backend`; tests assert `res.body.total` and `res.body.totalPages` with specific numeric values — if `count`/`pages` were still the only fields, those assertions would fail. Additionally, "returns correct envelope shape for first page" checks `res.body.page` and `res.body.limit` are present and correct.

6. All existing filter behaviours continue to work unchanged: `?category=<value>` filters by category (case-insensitive), `?inStock=true/false` filters by stock status, `?search=<term>` filters by name substring (case-insensitive), and combined filters narrow results correctly.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` — "filters by category" (4 electronics), "filters in-stock products" (11 in-stock), "filters by search term" (laptop), "returns empty array for unknown category", "returns empty data array when search matches nothing".

7. Pagination continues to work: `?page=<n>&limit=<m>` returns the correct slice; limit is clamped to a maximum of 50; page 2 returns a different set from page 1.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` — "returns a different set of products for page 2", "returns correct envelope shape for first page", "clamps limit to a maximum of 50".

8. Auth behaviour is unchanged: requests without a valid Bearer token receive HTTP 401 `{"error":"Unauthorized"}`; the `/health` route remains unprotected.
   - Verified by: `src/benchmark-backend/src/tests/visible/products.test.ts` — "returns 401 without auth header", "rejects a token whose digits sum to an odd number", "accepts any token whose digits sum to an even number", "rejects a request with no Bearer prefix", "does not apply auth to the /health route". (`src/middleware/auth.ts` must not be modified.)

9. Only `src/benchmark-backend/src/utils/queryParser.ts` and `src/benchmark-backend/src/services/productService.ts` are modified. No test files, no auth middleware, no Product type definition, and no data files are touched.
   - Verified by: `git diff --name-only` after implementation shows only those two files changed; `pnpm run build` (TypeScript compile) exits 0 with no errors.

10. The hyphenated sort mapping is implemented in `queryParser.ts` by translating incoming hyphenated strings (`price-asc` → `priceAsc`, `price-desc` → `priceDesc`, `rating-desc` → `ratingDesc`) to the existing `InternalSort` union type before passing the query to the service layer. The camelCase values accepted by the current parser (`priceAsc`, `priceDesc`, `ratingDesc`, `nameAsc`, `nameDesc`) continue to be accepted (backward compatibility).
    - Verified by: `pnpm test` in `src/benchmark-backend` passes all sort-related cases; additionally inspecting the compiled output of `queryParser.ts` shows the mapping logic rather than a hardcoded lookup limited to the three test fixtures.

## Edge cases

- Unknown/arbitrary sort string (e.g., `?sort=foobar`): no sort is applied; covered by requirement 10 (only valid mapped values pass through; unrecognised strings are silently ignored, which is the existing behaviour).
- `?sort=price-asc` with additional filters (e.g., `?sort=price-asc&category=electronics`): sort is applied after filtering; covered by requirements 1–3 and 6 (both behaviours are independently required to be correct).
- `?limit=100`: clamped to 50; `totalPages` is computed from the clamped limit; covered by requirement 7.
- Empty result set: `total=0`, `totalPages=0` (or 1, depending on implementation); covered by requirement 4 and edge cases in requirement 6 (empty-array tests).
- `page` and `limit` fields in the envelope are unchanged by the rename; covered by requirement 5.
