# Milestone

Task: task1
Target: backend

## Requirements addressed

- Req 1 — `GET /products?sort=price-asc` returns products sorted by price ascending: verified — test `"sorts by price ascending (frontend format)"` PASSED; `queryParser.ts` maps `price-asc` → `priceAsc`.
- Req 2 — `GET /products?sort=price-desc` returns products sorted by price descending: verified — test `"sorts by price descending (frontend format)"` PASSED; `queryParser.ts` maps `price-desc` → `priceDesc`.
- Req 3 — `GET /products?sort=rating-desc` returns products sorted by rating descending: verified — test `"sorts by rating descending (frontend format)"` PASSED; `queryParser.ts` maps `rating-desc` → `ratingDesc`.
- Req 4 — Response envelope field for total count is named `total`: verified — tests `"returns all products with pagination envelope"` and `"response envelope contains total and totalPages"` PASSED asserting `res.body.total === 15`.
- Req 5 — Response envelope field for total page count is named `totalPages`: verified — test `"response envelope contains total and totalPages"` PASSED asserting `res.body.totalPages === 3`.
- Req 6 — Only `queryParser.ts` and `productService.ts` modified; no test files touched: verified — git status clean; file inspection confirmed targeted changes only.
- Req 7 — Existing filters (category, search, inStock) preserved: verified — all five filter tests PASSED.
- Req 8 — Pagination (page, limit capped at 50) still works: verified — all three pagination tests PASSED.
- Req 9 — Auth middleware unchanged (401 without valid token, /health unprotected): verified — all five auth tests PASSED.
- Req 10 — All 18 visible tests pass with exit code 0: verified — `pnpm --filter benchmark-backend test` exited 0; `Test Files 1 passed (1), Tests 18 passed (18)`.

## Files changed

- `src/benchmark-backend/src/utils/queryParser.ts`: Added `SORT_ALIAS_MAP` constant and applied it to translate hyphenated frontend sort values (`price-asc`, `price-desc`, `rating-desc`) to camelCase internal values before the validity check.
- `src/benchmark-backend/src/services/productService.ts`: Renamed `count` → `total` and `pages` → `totalPages` in the `getAllProducts` return envelope to match the `PaginatedResponse<T>` type and frontend expectations.

## Checks

- pnpm test: 18 passed, 0 failed
- pnpm run build: pass (TypeScript strict mode satisfied; no type errors from field renames)
