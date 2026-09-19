# Milestone

Task: task5
Target: backend

## Requirements addressed
- Req 1 — featured: true on products 1, 8, 11, 14; all other 11 omit the field: verified — file inspection of src/data/products.ts confirmed correct placement; "Featured filter > returns only featured products when featured=true" asserted length===4, "returns only non-featured products when featured=false" asserted length===11
- Req 2 — GET /products?featured=true returns 200 with exactly 4 products each having featured===true: verified — test "Featured filter > returns only featured products when featured=true" passed (✓); 23/23 tests passed
- Req 3 — GET /products?featured=false returns 200 with exactly 11 products none having featured===true: verified — test "Featured filter > returns only non-featured products when featured=false" passed (✓); 23/23 tests passed
- Req 4 — GET /products?featured=true&category=electronics returns 200 with exactly 1 product id 1: verified — test "Featured filter > featured=true combined with category filter returns intersection" passed (✓); 23/23 tests passed
- Req 5 — GET /products?sort=rating_desc returns 200 with products in non-increasing rating order: verified — test "Rating sort > sorts by rating descending when sort=rating_desc" passed (✓); 23/23 tests passed
- Req 6 — 'rating_desc' added to VALID_SORT_OPTIONS in queryParser.ts: verified — line 3 of queryParser.ts confirmed; rating_desc sort test passed confirming value reaches service layer
- Req 7 — featured=true/false parsed to boolean; other values or absence leave query.featured unset: verified — queryParser.ts lines 22–26 confirmed strict equality pattern; all three Featured filter tests passed (✓)
- Req 8 — absent featured param applies no filtering; all products returned: verified — "GET /products > returns all products with pagination envelope" with ?limit=50 returned 15 total products (✓)
- Req 9 — sort logic in productService.ts does not mutate result array: verified — all sort branches use [...result].sort() spread copy; all sort tests passed (✓)
- Req 10 — all pre-existing tests continue to pass: verified — full suite 23 passed, 0 failed; all baseline, category, inStock, search, pagination, sort, and auth middleware tests (✓)

## Files changed
- src/benchmark-backend/src/data/products.ts: Added `featured: true` to products id 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), 14 (Clean Code)
- src/benchmark-backend/src/utils/queryParser.ts: Added `'rating_desc'` to VALID_SORT_OPTIONS; added featured param parsing (strict string equality, mirrors inStock pattern)
- src/benchmark-backend/src/services/productService.ts: Added featured filter after inStock block; added rating_desc sort branch (non-mutating spread copy)

## Checks
- pnpm test: 23 passed, 0 failed
- pnpm run build: pass
