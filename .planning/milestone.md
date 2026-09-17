# Milestone

Task: task1
Target: backend

## Requirements addressed

- Req 1 — `GET /products?sort=price-asc` returns 200 with products sorted price ascending: verified — test "sorts by price ascending (frontend format)" passed (18/18 suite pass)
- Req 2 — `GET /products?sort=price-desc` returns 200 with products sorted price descending: verified — test "sorts by price descending (frontend format)" passed
- Req 3 — `GET /products?sort=rating-desc` returns 200 with products sorted rating descending: verified — test "sorts by rating descending (frontend format)" passed
- Req 4 — Response envelope contains `total` equal to matching product count before pagination: verified — "returns all products with pagination envelope" and "response envelope contains total and totalPages" both assert `res.body.total === 15` and passed
- Req 5 — Response envelope contains `totalPages` equal to `Math.ceil(total/limit)`: verified — test asserts `res.body.totalPages === 3` with 15 products and limit=5; passed
- Req 6 — Envelope does NOT contain `count` or `pages`: verified — `productService.ts` returns `{ data, total, page, limit, totalPages }`; no test references old names; all 18 tests passed; build succeeded
- Req 7 — All existing filters (category, inStock, search) continue to work: verified — "filters by category", "returns empty array for unknown category", "filters in-stock products", "filters by search term", "returns empty data array when search matches nothing" all passed
- Req 8 — Pagination fields `page`, `limit`, `data` unchanged: verified — "returns correct envelope shape for first page", "returns a different set of products for page 2", "clamps limit to a maximum of 50" all passed
- Req 9 — Auth middleware unmodified: verified — all 5 auth tests passed (no header→401, odd digit sum→401, even digit sum→200, no Bearer prefix→401, /health→200)
- Req 10 — Only `queryParser.ts` and `productService.ts` modified: verified — no test files, auth files, or Product type changed; `tsc -p tsconfig.build.json` exit code 0

## Files changed

- `src/benchmark-backend/src/utils/queryParser.ts`: replaced camelCase `VALID_SORT_OPTIONS` array with a `SORT_MAP` object mapping hyphenated frontend keys (`price-asc`, `price-desc`, `rating-desc`) to their internal camelCase `InternalSort` values; unknown sort values (including former camelCase) are silently dropped
- `src/benchmark-backend/src/services/productService.ts`: renamed response envelope fields `count` → `total` and `pages` → `totalPages`; extracted `totalPages` as a local variable using `Math.ceil(total / limit)`

## Checks

- pnpm test: 18 passed, 0 failed
- pnpm run build: pass (tsc -p tsconfig.build.json exit code 0)
