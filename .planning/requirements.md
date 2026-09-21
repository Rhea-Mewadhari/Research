# Requirements

1. `GET /api/products/compare?ids=1,2` returns HTTP 200 with a JSON body containing a `products` array of length 2 and a `count` field equal to 2.
   - Verified by: `src/tests/visible/compare.test.ts` — "returns 200 with matching products for two valid ids" asserts `res.status === 200`, `res.body.products` is an array of length 2, and `res.body.count === 2`.

2. `GET /api/products/compare?ids=1` (fewer than two IDs) returns HTTP 400.
   - Verified by: `src/tests/visible/compare.test.ts` — "returns 400 when fewer than two ids are provided" asserts `res.status === 400`.

3. Each product object in the `products` array returned by `GET /api/products/compare` contains at least `id` and `name` fields with truthy values.
   - Verified by: `src/tests/visible/compare.test.ts` — "includes id and name in each returned product" asserts every element has `p.id` and `p.name` truthy.

4. `GET /api/products/:id` with a valid numeric product ID continues to return HTTP 200 with the correct product data (pre-existing behaviour must not regress).
   - Verified by: running `pnpm test` in `benchmark-backend/` — the full test suite (including any hidden tests) covers this path; no existing passing test for `/:id` must flip to failing.

5. `GET /api/products/:id` with a non-existent product ID continues to return HTTP 404 (pre-existing behaviour must not regress).
   - Verified by: running `pnpm test` in `benchmark-backend/` — same suite coverage as requirement 4.

6. The fix is confined to `src/routes/apiProductRoutes.ts` — no other source file is modified. Specifically, `src/controllers/compareController.ts`, `src/controllers/productController.ts`, `src/services/compareService.ts`, and `src/schemas/productSchema.ts` must remain byte-for-byte identical to their pre-fix state.
   - Verified by: `git diff --name-only` after the fix lists only `src/routes/apiProductRoutes.ts` (and no other source file).

7. All visible tests pass without modification to any test file.
   - Verified by: `pnpm test` exits with code 0 in the `benchmark-backend/` directory.

## Edge cases

- `ids=compare` (the literal string "compare" passed as an ID to `/:id`): covered by requirement 4 and 5 — once the route order is correct, Express will never reach `/:id` for the path `/compare`, so this degenerate case cannot occur at the routing level.
- Exactly two valid IDs supplied: covered by requirement 1.
- Exactly one ID supplied: covered by requirement 2.
- No `ids` param at all: covered by requirement 2 (schema validation rejects fewer than two IDs; zero IDs falls into the same ≤1 case and returns 400).
- Non-existent but numerically valid product ID: covered by requirement 5.
