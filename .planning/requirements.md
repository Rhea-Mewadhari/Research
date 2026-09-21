# Requirements

1. `GET /api/products/compare?ids=1,2` returns HTTP 200 with a JSON body containing a `products` array of length 2 and a `count` field equal to 2.
   - Verified by: `compare.test.ts` — "returns 200 with matching products for two valid ids" asserts `res.status === 200`, `Array.isArray(res.body.products)`, `res.body.products.toHaveLength(2)`, and `res.body.count === 2`.

2. Each product object in the `products` array from `GET /api/products/compare` includes at least an `id` field and a `name` field (both truthy).
   - Verified by: `compare.test.ts` — "includes id and name in each returned product" asserts `res.body.products.every(p => p.id && p.name)`.

3. `GET /api/products/compare?ids=1` (fewer than two IDs) returns HTTP 400.
   - Verified by: `compare.test.ts` — "returns 400 when fewer than two ids are provided" asserts `res.status === 400`.

4. `GET /api/products/:id` with a valid numeric product ID continues to return HTTP 200 with the correct product.
   - Verified by: running `pnpm test` in `src/benchmark-backend`; the existing product-by-ID logic must remain intact and the products visible-test suite must not regress (no new failures in `products.test.ts`).

5. `GET /api/products/:id` with a non-existent product ID returns HTTP 404.
   - Verified by: running `pnpm test` in `src/benchmark-backend`; the 404-for-unknown-id behaviour must remain intact and no new failures introduced in `products.test.ts`.

6. The fix is confined to `src/routes/apiProductRoutes.ts` — no changes to `src/controllers/compareController.ts`, `src/controllers/productController.ts`, `src/services/compareService.ts`, or `src/schemas/productSchema.ts`.
   - Verified by: `git diff --name-only` shows only `src/routes/apiProductRoutes.ts` modified.

7. All visible tests pass: `pnpm test` exits with code 0 in `src/benchmark-backend`.
   - Verified by: `pnpm test` terminal exit code 0 with no failing test cases reported.

---

## Edge cases

- Exactly one ID supplied (`ids=1`): covered by requirement 3.
- Zero IDs or missing `ids` param: the existing `compareQuerySchema` validation rejects these; covered by requirement 3 (400 response), and the routing fix must not bypass that validation.
- String "compare" treated as a dynamic `:id` segment before the fix: root cause of the bug; resolved by requirement 6 (route order change).
- Valid product IDs requested via `/api/products/:id` after the route reorder: covered by requirement 4 — must not regress.
- Non-existent product IDs after the route reorder: covered by requirement 5.
