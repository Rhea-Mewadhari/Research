# Requirements

1. `GET /api/products/compare?ids=1,2` returns HTTP 200 with a JSON body containing a `products` array of length 2 and a `count` field equal to 2.
   - Verified by: `compare.test.ts` — "returns 200 with matching products for two valid ids" asserts `res.status === 200`, `res.body.products` is an array of length 2, and `res.body.count === 2`.

2. Each product object in the `products` array from `GET /api/products/compare` contains at least an `id` field and a `name` field.
   - Verified by: `compare.test.ts` — "includes id and name in each returned product" asserts `res.body.products.every(p => p.id && p.name)`.

3. `GET /api/products/compare?ids=1` (fewer than two IDs) returns HTTP 400.
   - Verified by: `compare.test.ts` — "returns 400 when fewer than two ids are provided" asserts `res.status === 400`.

4. `GET /api/products/:id` with a valid numeric product ID continues to return HTTP 200 with the correct product.
   - Verified by: running `pnpm test` in `benchmark-backend`; the existing `products.test.ts` suite must continue to pass (no regressions on the `/:id` route).

5. `GET /api/products/:id` with a non-existent ID continues to return HTTP 404.
   - Verified by: running `pnpm test` in `benchmark-backend`; existing behaviour for unknown IDs is preserved after the fix.

6. Only `src/routes/apiProductRoutes.ts` is modified; no other source file differs from its pre-fix state.
   - Verified by: `git diff --name-only` after the fix lists exactly `src/routes/apiProductRoutes.ts` (relative to `benchmark-backend/`).

7. The `/compare` route is registered in `apiProductRoutes.ts` before the `/:id` route so that Express matches the static segment first.
   - Verified by: reading `src/routes/apiProductRoutes.ts` and confirming the line `router.get('/compare', ...)` appears before `router.get('/:id', ...)`.

## Edge cases

- `ids` query param with exactly one value: covered by requirement 3.
- `ids` query param with two or more valid IDs: covered by requirements 1 and 2.
- Non-existent product ID in `/:id`: covered by requirement 5.
- The string `"compare"` being treated as a dynamic `:id` segment (the original bug): eliminated by requirement 7, confirmed by requirements 1–3 passing.
