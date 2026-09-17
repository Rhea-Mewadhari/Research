# Requirements

1. `GET /products?sort=price-asc` returns HTTP 200 with a `data` array where each product's `price` is less than or equal to the next product's `price` (ascending order).
   - Verified by: `src/tests/visible/products.test.ts` — "sorts by price ascending (frontend format)" asserts `prices` equals `[...prices].sort((a, b) => a - b)`

2. `GET /products?sort=price-desc` returns HTTP 200 with a `data` array where each product's `price` is greater than or equal to the next product's `price` (descending order).
   - Verified by: `src/tests/visible/products.test.ts` — "sorts by price descending (frontend format)" asserts `prices` equals `[...prices].sort((a, b) => b - a)`

3. `GET /products?sort=rating-desc` returns HTTP 200 with a `data` array where each product's `rating` is greater than or equal to the next product's `rating` (descending order).
   - Verified by: `src/tests/visible/products.test.ts` — "sorts by rating descending (frontend format)" asserts `ratings` equals `[...ratings].sort((a, b) => b - a)`

4. The `parseProductQuery` function in `src/utils/queryParser.ts` maps the three hyphenated frontend sort values to their camelCase internal equivalents (`price-asc` → `priceAsc`, `price-desc` → `priceDesc`, `rating-desc` → `ratingDesc`) before the `VALID_SORT_OPTIONS` membership check, so the mapped value is stored as `query.sort`.
   - Verified by: requirements 1–3 passing (sort is silently dropped today; once correctly mapped, the service sorts correctly)

5. The response envelope for `GET /products` contains a `total` field (integer equal to the count of matching products before pagination) and a `totalPages` field (integer equal to `Math.ceil(total / limit)`). The legacy fields `count` and `pages` must not appear in their place.
   - Verified by: `src/tests/visible/products.test.ts` — "response envelope contains total and totalPages" asserts `res.body.total === 15` and `res.body.totalPages === 3` for `page=1&limit=5` with 15 total products; "returns all products with pagination envelope" asserts `res.body.total === 15`

6. All existing filters continue to produce the same results after the changes: category filter returns only matching products, inStock filter returns only in-stock products, search filter returns only products whose name includes the search term (case-insensitive), and an unknown category or non-matching search term returns an empty `data` array.
   - Verified by: `src/tests/visible/products.test.ts` — "filters by category" (4 electronics), "returns empty array for unknown category", "filters in-stock products" (11 in-stock), "filters by search term" (laptop results non-empty), "returns empty data array when search matches nothing"

7. The TypeScript project compiles without type errors after all changes.
   - Verified by: `pnpm --filter benchmark-backend build` exits with code 0

8. All visible tests pass after the changes.
   - Verified by: `pnpm --filter benchmark-backend test` exits with code 0 and reports no failing test cases

## Edge cases

- Unrecognised sort values (e.g., `sort=foo`, `sort=PRICE-ASC`): covered by requirement 4 — only the three exact hyphenated strings are mapped; anything else falls through the existing `VALID_SORT_OPTIONS` check and is silently dropped, preserving existing behaviour.
- Empty result set pagination (`totalPages` when `total === 0`): covered by requirement 5 — `Math.ceil(0 / limit)` is `0`, which must be the value returned.
- Pagination envelope fields `page` and `limit` (not part of the fix but must remain): covered by requirement 6 — "returns correct envelope shape for first page" and related tests assert `res.body.page` and `res.body.limit`, so regressions are caught.
- Auth middleware behaviour is unchanged: covered by requirement 8 — all Auth middleware tests must continue to pass.
- `limit` clamping to 50 is unchanged: covered by requirement 8 — "clamps limit to a maximum of 50" must continue to pass.
