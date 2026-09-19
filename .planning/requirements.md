# Requirements

1. Products with id 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), and 14 (Clean Code) must have `featured: true` set in `src/data/products.ts`.
   - Verified by: `pnpm test` — the "Featured filter / returns only featured products when featured=true" test asserts `res.body.data.length === 4` and `res.body.data.every(p => p.featured === true)`.

2. All products not in the featured set (ids 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 15) must not have `featured: true` (field is omitted or `false`).
   - Verified by: `pnpm test` — the "Featured filter / returns only non-featured products when featured=false" test asserts `res.body.data.length === 11` and `res.body.data.every(p => !p.featured)`.

3. `'rating_desc'` must be added to the `VALID_SORT_OPTIONS` array in `src/utils/queryParser.ts` so it is not silently dropped by the parser's `includes` guard.
   - Verified by: `pnpm test` — the "Rating sort / sorts by rating descending when sort=rating_desc" test asserts the returned ratings array equals `[...ratings].sort((a, b) => b - a)`; if `rating_desc` is not in `VALID_SORT_OPTIONS` the sort param is ignored and the test fails.

4. `parseProductQuery` in `src/utils/queryParser.ts` must set `query.featured = true` when the raw query string contains `featured=true`, and `query.featured = false` when it contains `featured=false`. Any other value (absent, empty string, arbitrary string) must leave `query.featured` undefined.
   - Verified by: `pnpm test` — the Featured filter suite passes only when the parser correctly maps the string `"true"` / `"false"` to booleans; an undefined `query.featured` would bypass the service filter entirely.

5. `getAllProducts` in `src/services/productService.ts` must filter the result set to products where `(p.featured ?? false) === query.featured` when `query.featured` is defined.
   - Verified by: `pnpm test` — all three tests in the "Featured filter" suite must pass: `featured=true` (4 results all with `featured===true`), `featured=false` (11 results all with `!p.featured`), and the combination `featured=true&category=electronics` (1 result, id 1).

6. `getAllProducts` in `src/services/productService.ts` must sort results by `rating` descending (`b.rating - a.rating`) when `query.sort === 'rating_desc'`. The sort must not mutate the source array (use a derived copy).
   - Verified by: `pnpm test` — the "Rating sort / sorts by rating descending when sort=rating_desc" test asserts the returned `ratings` array equals the same array sorted with `(a, b) => b - a`.

7. All pre-existing tests must continue to pass without regression.
   - Verified by: `pnpm test` exits with code 0 and all tests in the "GET /products", "Pagination", and "Auth middleware" describe blocks pass with the same assertions as before this task.

---

## Edge cases

- Products whose `featured` field is omitted (not set at all) are treated as not featured: `(p.featured ?? false)` evaluates to `false` — covered by requirement 5.
- `featured=true` combined with `category=electronics` returns only the single intersection (Laptop, id 1) because both filters are applied sequentially — covered by requirement 5 (third test).
- `rating_desc` passed as a sort value is not silently dropped before reaching the service — covered by requirement 3 (parser must include it in `VALID_SORT_OPTIONS`).
- `featured` query param with a value other than `"true"` or `"false"` (e.g. absent or malformed) leaves `query.featured` undefined, so no featured filter is applied — covered by requirement 4.
- The `rating_desc` sort must not mutate the `result` array in place; a spread copy must be used (`[...result].sort(...)`) — covered by requirement 6.
