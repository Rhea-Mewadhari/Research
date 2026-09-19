# Milestone

Task: task5
Target: backend

## Requirements addressed

- Requirement 1 — `featured: true` on ids 1, 8, 11, 14: verified — File inspection confirmed `featured: true` on lines 14, 92, 126, 163; all other 11 products have no `featured` field. Test "Featured filter > returns only featured products when featured=true" passed.
- Requirement 2 — `queryParser.ts` parses `featured` param: verified — Lines 22-26 parse `'true'` → `true`, `'false'` → `false`; absence leaves `query.featured` undefined. Tests "returns only non-featured products when featured=false" and "returns all products with pagination envelope" passed.
- Requirement 3 — `rating_desc` in `VALID_SORT_OPTIONS`: verified — Line 3 of `queryParser.ts` includes `"rating_desc"` in the array. Test "Rating sort > sorts by rating descending when sort=rating_desc" passed.
- Requirement 4 — Featured filter in `productService.ts`: verified — Lines 23-25 apply `(p.featured ?? false) === query.featured` after all other filters. Tests for `featured=true` (4 products), `featured=false` (11 products), and `featured=true&category=electronics` (1 product, id=1) all passed.
- Requirement 5 — `rating_desc` sort in `productService.ts`: verified — Lines 35-36 use `[...result].sort((a, b) => b.rating - a.rating)` (spread copy, no mutation). Test "Rating sort > sorts by rating descending when sort=rating_desc" passed.
- Requirement 6 — All existing tests continue to pass: verified — `pnpm test` (vitest run) exited with code 0; 23/23 tests passed across all suites: GET /products (11), Pagination (3), Auth middleware (4), Featured filter (3), Rating sort (1). Build (`pnpm run build`) also passed cleanly.

## Files changed

- `src/benchmark-backend/src/data/products.ts`: Added `featured: true` to product objects with ids 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), and 14 (Clean Code)
- `src/benchmark-backend/src/utils/queryParser.ts`: Added `'rating_desc'` to `VALID_SORT_OPTIONS`; added `featured` boolean query param parsing block modelled after existing `inStock` parsing
- `src/benchmark-backend/src/services/productService.ts`: Added featured filter block after inStock filter; added `rating_desc` sort branch using spread copy pattern

## Checks

- pnpm test: 23 passed, 0 failed
- pnpm run build: pass
