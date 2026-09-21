# Requirements

1. `GET /api/products/compare?ids=1,2` returns HTTP 200 with a JSON body containing a `products` array of length 2 and a `count` field equal to 2.
   - Verified by: `compare.test.ts` — "returns 200 with matching products for two valid ids" asserts `res.status === 200`, `res.body.products.length === 2`, and `res.body.count === 2`.

2. `GET /api/products/compare?ids=1` (fewer than two IDs) returns HTTP 400.
   - Verified by: `compare.test.ts` — "returns 400 when fewer than two ids are provided" asserts `res.status === 400`.

3. Each product object in the `/compare` response includes `id` and `name` fields.
   - Verified by: `compare.test.ts` — "includes id and name in each returned product" asserts `res.body.products.every(p => p.id && p.name)`.

4. `GET /api/products/:id` with a valid numeric product ID returns HTTP 200 with the correct product data.
   - Verified by: `pnpm test` in `benchmark-backend` — existing products.test.ts passes (no regression); confirmed by running the test suite and checking all tests green.

5. `GET /api/products/:id` with a non-existent product ID returns HTTP 404.
   - Verified by: `pnpm test` in `benchmark-backend` — existing products.test.ts passes (no regression); confirmed by running the test suite and checking all tests green.

6. Only `src/routes/apiProductRoutes.ts` is modified — no changes to `compareController.ts`, `productController.ts`, `compareService.ts`, or `productSchema.ts`.
   - Verified by: `git diff --name-only` shows only `src/routes/apiProductRoutes.ts` changed.

## Edge cases

- `ids` query param omitted entirely: covered by requirement 2 (zero IDs < two IDs, returns 400).
- `ids=1,2,3` (more than two IDs): compareController/compareService handle this — routing fix must not break multi-ID comparisons; covered implicitly by requirement 1 (routing must reach the controller correctly).
- `/:id` route with the literal string "compare" as an ID: after the fix, `/compare` is matched by the static route (requirement 1–3) before the wildcard route ever sees it, so "compare" is never treated as an ID.
