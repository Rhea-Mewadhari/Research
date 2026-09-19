# Milestone

Task: task5
Target: backend

## Requirements addressed

- Requirement 1 — Exactly four products have `featured: true` (id 1 Laptop, id 8 Ergonomic Chair, id 11 Yoga Mat, id 14 Clean Code); all 11 others omit the field: verified — `grep 'featured: true' products.ts` returns exactly 4 lines; `featured=true&limit=50` returns 4 items; `featured=false&limit=50` returns 11 items.
- Requirement 2 — `featured=true` parsed to boolean `true`, `featured=false` to boolean `false`, absent leaves field unset: verified — Featured filter tests all pass; wrong parsing would return 15 products instead of 4 or 11.
- Requirement 3 — `'rating_desc'` accepted as a valid sort option (not silently dropped): verified — Rating sort test passes; if dropped, sort order assertion would fail.
- Requirement 4 — When `query.featured` is defined, filter uses `(p.featured ?? false) === query.featured`: verified — 4 items for `featured=true`, 11 for `featured=false`, 1 item (id 1) for `featured=true&category=electronics`.
- Requirement 5 — When `query.sort === 'rating_desc'`, products sorted by `rating` highest-first: verified — Rating sort test confirms `ratings` equals `[...ratings].sort((a, b) => b - a)`.
- Requirement 6 — `src/benchmark-backend/src/types/product.ts` not modified: verified — `git diff HEAD -- src/benchmark-backend/src/types/product.ts` produced no output.
- Requirement 7 — All pre-existing suites pass unchanged: verified — `pnpm test` exited 0; 23 tests passed across GET /products (11), Pagination (3), Auth middleware (4), Featured filter (3), Rating sort (1).

## Files changed

- `src/benchmark-backend/src/data/products.ts`: Added `featured: true` to products with id 1, 8, 11, and 14.
- `src/benchmark-backend/src/utils/queryParser.ts`: Added `'rating_desc'` to `VALID_SORT_OPTIONS`; added boolean parsing for `featured` query parameter following the `inStock` pattern.
- `src/benchmark-backend/src/services/productService.ts`: Added `featured` filter step (`(p.featured ?? false) === query.featured`); added `rating_desc` sort branch (`b.rating - a.rating`).

## Checks

- pnpm test: 23 passed, 0 failed
- pnpm run build: pass
