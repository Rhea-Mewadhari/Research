# Milestone

Task: task1
Target: backend

## Requirements addressed

- Req 1 — GET /products?sort=price-asc returns HTTP 200 with prices sorted ascending: verified — vitest '✓ sorts by price ascending (frontend format)' PASSED; 18/18 tests passed.
- Req 2 — GET /products?sort=price-desc returns HTTP 200 with prices sorted descending: verified — vitest '✓ sorts by price descending (frontend format)' PASSED; 18/18 tests passed.
- Req 3 — GET /products?sort=rating-desc returns HTTP 200 with ratings sorted descending: verified — vitest '✓ sorts by rating descending (frontend format)' PASSED; 18/18 tests passed.
- Req 4 — Response envelope includes `total` and `totalPages` fields: verified — vitest '✓ response envelope contains total and totalPages' PASSED (total===15, totalPages===3); '✓ returns all products with pagination envelope' PASSED (total===15).
- Req 5 — Envelope must NOT use `count`/`pages`; `page` and `limit` remain: verified — productService.ts:43 returns `{ data, total: count, page, limit, totalPages: pages }`; '✓ returns correct envelope shape for first page' PASSED.
- Req 6 — All existing filter behaviours (category, inStock, search, combined) unchanged: verified — all five filter tests PASSED; 18/18 tests passed.
- Req 7 — Pagination (page/limit slice, limit clamped to 50, page 2 differs from page 1): verified — all three pagination tests PASSED; queryParser.ts applies Math.min(limitVal, 50).
- Req 8 — Auth behaviour unchanged (401 without valid token, /health unprotected): verified — all five auth tests PASSED; auth.ts not modified.
- Req 9 — Only queryParser.ts and productService.ts modified; pnpm run build exits 0: verified — build exited 0; git diff --name-only confirms only two target files changed.
- Req 10 — Hyphenated sort mapping in queryParser.ts with camelCase backward compatibility: verified — HYPHENATED_SORT_MAP at lines 24-28 maps price-asc→priceAsc, price-desc→priceDesc, rating-desc→ratingDesc; VALID_SORT_OPTIONS retains all camelCase variants.

## Files changed

- `src/benchmark-backend/src/utils/queryParser.ts`: added HYPHENATED_SORT_MAP constant and pre-whitelist translation step to convert hyphenated sort strings to camelCase InternalSort values.
- `src/benchmark-backend/src/services/productService.ts`: renamed response envelope keys from `count`/`pages` to `total`/`totalPages` while keeping local variable names unchanged.

## Checks

- pnpm test: 18 passed, 0 failed
- pnpm run build: pass
