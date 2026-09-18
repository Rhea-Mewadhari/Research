# Milestone

Task: task3
Target: backend

## Requirements addressed

- Req 1 — category=electronics returns 200, total:4, all items category==='electronics': verified — Test at products.test.ts:41-47 passed; pnpm vitest run 22/22.
- Req 2 — category=Electronics (case-insensitive) returns same 4 results: verified — Test at products.test.ts:49-54 passed; pnpm vitest run 22/22.
- Req 3 — unknown category returns data:[] and total:0: verified — Test at products.test.ts:56-61 passed; pnpm vitest run 22/22.
- Req 4 — inStock=true returns 11 products all with inStock===true: verified — Test at products.test.ts:63-68 passed; pnpm vitest run 22/22.
- Req 5 — inStock=false returns 4 products all with inStock===false: verified — Test at products.test.ts:70-75 passed; pnpm vitest run 22/22.
- Req 6 — search=laptop (case-insensitive) returns 1 result, data[0].name==='Laptop': verified — Test at products.test.ts:20-25 passed; pnpm vitest run 22/22.
- Req 7 — search=wire (partial match) returns 1 result, data[0].name==='Wireless Headphones': verified — Test at products.test.ts:27-32 passed; pnpm vitest run 22/22.
- Req 8 — search=%20laptop%20 (URL-encoded spaces trimmed) returns 1 result, data[0].name==='Laptop': verified — Test at products.test.ts:34-39 passed; pnpm vitest run 22/22.
- Req 9 — sort=price_asc returns Jump Rope first at price 19: verified — Test at products.test.ts:77-82 passed; pnpm vitest run 22/22.
- Req 10 — sort=price_desc returns Laptop first at price 999: verified — Test at products.test.ts:84-89 passed; pnpm vitest run 22/22.
- Req 11 — sort=name_asc returns Bookshelf first: verified — Test at products.test.ts:91-95 passed; pnpm vitest run 22/22.
- Req 12 — sort=name_desc returns Yoga Mat first: verified — Test at products.test.ts:97-101 passed; pnpm vitest run 22/22.
- Req 13 — default GET /products returns total:15, page:1, limit:10, totalPages:2, data.length:10: verified — Test at products.test.ts:120-128 passed; pnpm vitest run 22/22.
- Req 14 — page=2 returns page:2, data.length:5, total:15: verified — Test at products.test.ts:130-136 passed; pnpm vitest run 22/22.
- Req 15 — page 1 and page 2 product IDs are completely disjoint: verified — Test at products.test.ts:138-145 passed; pnpm vitest run 22/22.
- Req 16 — limit=100 clamped to 50, data.length:15: verified — Test at products.test.ts:147-152 passed; pnpm vitest run 22/22.
- Req 17 — category=electronics&inStock=true returns total:3, 3 in-stock electronics: verified — Test at products.test.ts:103-109 passed; pnpm vitest run 22/22.
- Req 18 — search=chair&sort=price_desc returns total:1, data[0].name==='Ergonomic Chair': verified — Test at products.test.ts:111-116 passed; pnpm vitest run 22/22.
- Req 19 — no Authorization header returns 401, body.error==='Unauthorized': verified — Test at products.test.ts:156-160 passed; pnpm vitest run 22/22.
- Req 20 — invalid token benchmark-token-2023 (digit sum 7, odd) returns 401: verified — Test at products.test.ts:162-166 passed; pnpm vitest run 22/22.
- Req 21 — valid token benchmark-token-2024 (digit sum 8, even) returns 200: verified — Test at products.test.ts:168-171 passed; pnpm vitest run 22/22.
- Req 22 — GET /health with no auth header returns 200, body.status==='ok': verified — Test at products.test.ts:173-177 passed; pnpm vitest run 22/22.
- Req 23 — vi.mock on fetchAllProducts wired, mockResolvedValue in beforeAll, no app source files modified: verified — vi.mock at products.test.ts:5, beforeAll at lines 15-17; git diff --name-only returned empty; pnpm vitest run 22/22.
- Req 24 — deterministic results across two successive runs: verified — Run 1 and Run 2 both produced 22/22 passed with identical output.

## Files changed

- `src/benchmark-backend/src/tests/visible/products.test.ts`: added 22 Vitest+Supertest test cases covering filtering, search, sorting, pagination, combined filters, and Bearer token authentication

## Checks

- pnpm test: 22 passed, 0 failed
- pnpm run build: pass
