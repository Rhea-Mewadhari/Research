# Milestone

Task: task5
Target: backend

## Requirements addressed
- Products id 1, 8, 11, 14 have `featured: true`: verified — products.ts confirmed id 1 (line 12), id 8 (line 90), id 11 (line 124), id 14 (line 160) each have `featured: true`; remaining 11 products omit the field; "Featured filter" suite `featured=true` test asserted `res.body.data.length === 4` and all `p.featured === true` — PASSED (23/23 tests).
- `rating_desc` added to `VALID_SORT_OPTIONS`: verified — queryParser.ts line 3 includes `'rating_desc'` in the array; "Rating sort" suite sent `GET /products?sort=rating_desc&limit=50` and received 200 with correctly sorted ratings — PASSED (23/23 tests).
- `parseProductQuery` parses `featured` param: verified — queryParser.ts lines 22–26 set `query.featured = true` for raw `'true'`, `query.featured = false` for raw `'false'`, and leave it undefined otherwise; all "Featured filter" HTTP tests PASSED (23/23 tests).
- `getAllProducts` applies featured filter when defined: verified — productService.ts lines 23–25 filter with `(p.featured ?? false) === query.featured` when `query.featured !== undefined`; three scenarios tested (`featured=true` → 4, `featured=false` → 11, `featured=true&category=electronics` → 1) — PASSED (23/23 tests).
- `getAllProducts` sorts by `rating_desc` without mutating source array: verified — productService.ts lines 35–37 use `[...result].sort((a, b) => b.rating - a.rating)`; "Rating sort" test asserted sorted order across all 15 products — PASSED (23/23 tests).
- Pre-existing suites pass unmodified: verified — pnpm test output `Tests 23 passed (23)` with 0 failures across "GET /products", "Pagination", and "Auth middleware" suites — PASSED.

## Files changed
- `src/benchmark-backend/src/data/products.ts`: Added `featured: true` to products with id 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), and 14 (Clean Code).
- `src/benchmark-backend/src/utils/queryParser.ts`: Added `'rating_desc'` to `VALID_SORT_OPTIONS`; added `featured` query param parsing (true/false string → boolean, absent/invalid → undefined).
- `src/benchmark-backend/src/services/productService.ts`: Added featured filter branch and `rating_desc` sort branch (spread-copy pattern).

## Checks
- pnpm test: 23 passed, 0 failed
- pnpm run build: pass
