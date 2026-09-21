# Requirements

1. `GET /api/products/compare?ids=1,2` returns HTTP 200 with a JSON body containing a `products` array of length 2 and a `count` of 2.
   - Verified by: `compare.test.ts` — "returns 200 with matching products for two valid ids" (asserts `res.status === 200`, `res.body.products.length === 2`, `res.body.count === 2`)

2. `GET /api/products/compare?ids=1` (fewer than two IDs) returns HTTP 400.
   - Verified by: `compare.test.ts` — "returns 400 when fewer than two ids are provided" (asserts `res.status === 400`)

3. Each product object in the compare response includes at minimum an `id` field and a `name` field (both truthy).
   - Verified by: `compare.test.ts` — "includes id and name in each returned product" (asserts `res.body.products.every(p => p.id && p.name)`)

4. `GET /api/products/:id` with a valid numeric ID continues to return the correct product (HTTP 200).
   - Verified by: `pnpm test` passes for the existing product-by-ID tests (no regression); the route must still be registered and functional after the fix.

5. `GET /api/products/:id` with a non-existent ID continues to return HTTP 404.
   - Verified by: `pnpm test` passes for the existing 404-for-unknown-id tests (no regression).

6. The fix is confined to `src/routes/apiProductRoutes.ts` — specifically, `router.get('/compare', ...)` must be registered before `router.get('/:id', ...)`. No other source file is modified.
   - Verified by: `git diff --name-only` after the fix shows only `src/routes/apiProductRoutes.ts`; code review confirms `/compare` line appears before `/:id` line in that file.

## Edge cases

- `ids=compare` (the string "compare" supplied as an ID to the `/:id` route): covered by requirement 4 — the `/:id` route must still function correctly for valid IDs, and the compare route's earlier registration prevents "compare" from being mistakenly routed to `/:id`.
- `ids=` (empty query string on compare): covered by requirement 2 — fewer than two IDs triggers HTTP 400.
- Multiple IDs beyond two (e.g. `ids=1,2,3`): not explicitly required by the spec; the compare controller handles this; routing fix does not affect it.
- No `ids` query param at all on `/compare`: covered by requirement 2 — the schema validation enforces at least two IDs, returning HTTP 400.
