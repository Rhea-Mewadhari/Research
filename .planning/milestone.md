# Milestone

Task: task1
Target: backend

## Requirements addressed

- Req 1 — GET /products?sort=price-asc returns products sorted by price ascending: verified — test 'sorts by price ascending (frontend format)' passed; productService.ts sorts by `a.price - b.price` when `query.sort === 'price-asc'`.
- Req 2 — GET /products?sort=price-desc returns products sorted by price descending: verified — test 'sorts by price descending (frontend format)' passed; productService.ts sorts by `b.price - a.price`.
- Req 3 — GET /products?sort=rating-desc returns products sorted by rating descending: verified — test 'sorts by rating descending (frontend format)' passed; productService.ts sorts by `b.rating - a.rating`.
- Req 4 — Response envelope contains `total` and `totalPages` (not `count`/`pages`): verified — tests 'response envelope contains total and totalPages' (total===15, totalPages===3) and 'returns all products with pagination envelope' (total===15) passed; productService.ts returns `{ data, total: count, page, limit, totalPages: pages }`.
- Req 5 — Response envelope retains `data`, `page`, `limit`: verified — test 'returns correct envelope shape for first page' passed (data.length===5, page===1, limit===5).
- Req 6 — Existing filters (category, inStock, search) unchanged: verified — tests 'filters by category', 'returns empty array for unknown category', 'filters in-stock products', 'filters by search term', 'returns empty data array when search matches nothing' all passed.
- Req 7 — Pagination works; limit clamped to 50: verified — tests 'returns a different set of products for page 2' and 'clamps limit to a maximum of 50' passed; queryParser.ts uses `Math.min(limitVal, 50)`.
- Req 8 — Auth middleware unchanged: verified — all 5 auth tests passed; `src/middleware/auth.ts` not modified.
- Req 9 — Product data shape unchanged: verified — `tsc --noEmit` produced zero errors; all field accesses (p.price, p.rating, p.category, p.inStock, p.name) pass.
- Req 10 — Changes confined to queryParser.ts and productService.ts, no test files modified: verified — git diff confirms only those two files were changed; test file is byte-for-byte identical to injected version.

## Files changed

- `src/benchmark-backend/src/utils/queryParser.ts`: Updated `InternalSort` type and `VALID_SORT_OPTIONS` from camelCase (`priceAsc`, `priceDesc`, `ratingDesc`, `nameAsc`, `nameDesc`) to hyphenated format (`price-asc`, `price-desc`, `rating-desc`, `name-asc`, `name-desc`) so the frontend's query param format is accepted.
- `src/benchmark-backend/src/services/productService.ts`: Updated local `InternalSort` type to match hyphenated literals; updated all sort comparison branches accordingly; renamed returned object keys from `count`/`pages` to `total`/`totalPages` (internal variables `count` and `pages` retained, aliased at the return site).

## Checks

- pnpm test: 18 passed, 0 failed
- pnpm run build: pass (tsc --noEmit produced no errors)
