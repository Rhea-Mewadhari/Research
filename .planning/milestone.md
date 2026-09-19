# Milestone

Task: task5
Target: backend

## Requirements addressed

- Req 1 — Products id 1, 8, 11, 14 have `featured: true`: verified — file inspection confirmed `featured: true` at lines 11, 89, 123, 159; test "Featured filter > returns only featured products when featured=true" PASSED.
- Req 2 — All other products (ids 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 15) have no `featured` field: verified — file inspection confirmed no `featured` field on those objects; test "Featured filter > returns only non-featured products when featured=false" PASSED.
- Req 3 — `'rating_desc'` added to `VALID_SORT_OPTIONS`: verified — queryParser.ts line 3 includes `'rating_desc'`; test "Rating sort > sorts by rating descending when sort=rating_desc" PASSED.
- Req 4 — `parseProductQuery` maps `featured=true`/`featured=false` to booleans, leaves undefined otherwise: verified — lines 22–26 in queryParser.ts implement the conditional; all three Featured filter tests PASSED.
- Req 5 — `getAllProducts` filters by `(p.featured ?? false) === query.featured` when defined: verified — lines 23–25 in productService.ts implement the filter; all three Featured filter tests PASSED including the combined `featured=true&category=electronics` intersection test.
- Req 6 — `getAllProducts` sorts by `rating` descending via `[...result].sort((a, b) => b.rating - a.rating)` without mutating source: verified — lines 35–37 in productService.ts use spread copy; test "Rating sort > sorts by rating descending when sort=rating_desc" PASSED.
- Req 7 — No regressions in pre-existing tests: verified — all 23 tests passed (GET /products: 12, Pagination: 3, Auth middleware: 4, Featured filter: 3, Rating sort: 1); `tsc -p tsconfig.build.json` exit code 0.

## Files changed

- `src/benchmark-backend/src/data/products.ts`: Added `featured: true` to product objects with id 1, 8, 11, 14.
- `src/benchmark-backend/src/utils/queryParser.ts`: Added `'rating_desc'` to `VALID_SORT_OPTIONS`; added `featured` boolean parsing block.
- `src/benchmark-backend/src/services/productService.ts`: Added featured filter block and `rating_desc` sort branch.

## Checks

- pnpm test: 23 passed, 0 failed
- pnpm run build: pass
