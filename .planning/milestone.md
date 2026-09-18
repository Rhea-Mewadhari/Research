# Milestone

Task: task3
Target: backend

## Requirements addressed

- Req 1 — Auth: missing Authorization header returns 401: verified — Test 'no Authorization header returns 401 Unauthorized' passed. 20/20 tests passed, exit 0.
- Req 2 — Auth: invalid token (odd digit sum) returns 401: verified — Test 'invalid token with odd digit sum returns 401 Unauthorized' passed. 20/20 tests passed, exit 0.
- Req 3 — Auth: valid token (even digit sum) returns 200: verified — Test 'valid token with even digit sum returns 200' passed. 20/20 tests passed, exit 0.
- Req 4 — Auth: GET /health exempt from auth: verified — Test 'GET /health with no Authorization header returns 200' passed. 20/20 tests passed, exit 0.
- Req 5 — Filtering: category exact match (lowercase) returns 4 electronics products: verified — res.body.total === 4, every item category === 'electronics'. 20/20 tests passed, exit 0.
- Req 6 — Filtering: category case-insensitive (uppercase ELECTRONICS) returns 4 products: verified — same 4 electronics products returned. 20/20 tests passed, exit 0.
- Req 7 — Filtering: unknown category returns empty data: verified — res.body.data.length === 0, res.body.total === 0. 20/20 tests passed, exit 0.
- Req 8 — Filtering: inStock=true returns 11 products: verified — res.body.total === 11, every item inStock === true. 20/20 tests passed, exit 0.
- Req 9 — Filtering: inStock=false returns 4 products: verified — res.body.total === 4, every item inStock === false. 20/20 tests passed, exit 0.
- Req 10 — Search: case-insensitive (LAPTOP → Laptop): verified — res.body.total === 1, res.body.data[0].name === 'Laptop'. 20/20 tests passed, exit 0.
- Req 11 — Search: partial match (phone → Smartphone): verified — res.body.total >= 1, res.body.data[0].name === 'Smartphone'. 20/20 tests passed, exit 0.
- Req 12 — Search: whitespace trimmed (' laptop ' → Laptop): verified — res.body.total === 1, res.body.data[0].name === 'Laptop'. 20/20 tests passed, exit 0.
- Req 13 — Sorting: price_asc cheapest first: verified — data[0].price === 19, all adjacent pairs non-decreasing. 20/20 tests passed, exit 0.
- Req 14 — Sorting: price_desc most expensive first: verified — data[0].price === 999, all adjacent pairs non-increasing. 20/20 tests passed, exit 0.
- Req 15 — Sorting: name_asc alphabetically: verified — data[0].name === 'Bookshelf', adjacent names localeCompare <= 0. 20/20 tests passed, exit 0.
- Req 16 — Sorting: name_desc reverse-alphabetically: verified — data[0].name === 'Yoga Mat', adjacent names localeCompare >= 0. 20/20 tests passed, exit 0.
- Req 17 — Pagination: default envelope shape (10 items, total 15, page 1, limit 10, totalPages 2): verified — all five fields asserted correctly. 20/20 tests passed, exit 0.
- Req 18 — Pagination: page 2 returns 5 items with no id overlap with page 1: verified — data.length === 5, page === 2, no id overlap confirmed. 20/20 tests passed, exit 0.
- Req 19 — Pagination: limit=100 clamped to 50: verified — res.body.limit === 50, data.length === 15, totalPages === 1. 20/20 tests passed, exit 0.
- Req 20 — Combined filters: category=electronics&inStock=true returns 3 products: verified — res.body.total === 3, all items electronics and inStock. 20/20 tests passed, exit 0.

## Files changed

- src/benchmark-backend/src/tests/visible/products.test.ts: filled all three empty describe blocks (Auth middleware, GET /products, Pagination) with 20 passing Vitest + Supertest tests covering filtering, search, sorting, pagination, combined filters, and Bearer token auth

## Checks

- pnpm test: 20 passed, 0 failed
- pnpm run build: pass
