# Milestone

Task: task3
Target: backend

## Requirements addressed

- Req 1 — category=electronics filter: verified — expect(res.body.total).toBe(4), all items have category 'electronics'. vitest: 21 passed.
- Req 2 — category=ELECTRONICS (uppercase): verified — expect(res.body.total).toBe(4). vitest: 21 passed.
- Req 3 — inStock=true filter: verified — expect(res.body.total).toBe(11), all items inStock true. vitest: 21 passed.
- Req 4 — inStock=false filter: verified — expect(res.body.total).toBe(4), all items inStock false. vitest: 21 passed.
- Req 5 — unknown category returns empty: verified — expect(res.body.total).toBe(0), data=[]. vitest: 21 passed.
- Req 6 — search=LAPTOP (case-insensitive): verified — expect(res.body.total).toBe(1), data[0].name='Laptop'. vitest: 21 passed.
- Req 7 — search=lap (partial match): verified — expect(res.body.total).toBe(1), data[0].name='Laptop'. vitest: 21 passed.
- Req 8 — search with whitespace trimming: verified — expect(res.body.total).toBe(1), data[0].name='Laptop'. vitest: 21 passed.
- Req 9 — sort=price_asc: verified — expect(res.body.data[0].price).toBe(19). vitest: 21 passed.
- Req 10 — sort=price_desc: verified — expect(res.body.data[0].price).toBe(999). vitest: 21 passed.
- Req 11 — sort=name_asc: verified — expect(res.body.data[0].name).toBe('Bookshelf'). vitest: 21 passed.
- Req 12 — sort=name_desc: verified — expect(res.body.data[0].name).toBe('Yoga Mat'). vitest: 21 passed.
- Req 13 — default pagination envelope: verified — data.length=10, total=15, page=1, limit=10, totalPages=2. vitest: 21 passed.
- Req 14 — page=2&limit=10: verified — page=2, data.length=5, data[0].id !== 1. vitest: 21 passed.
- Req 15 — limit=100 clamped to 50: verified — expect(res.body.limit).toBe(50). vitest: 21 passed.
- Req 16 — category=electronics&inStock=true combined: verified — total=3, all items category='electronics' and inStock=true. vitest: 21 passed.
- Req 17 — category=sports&sort=price_asc combined: verified — total=3, data[0].name='Jump Rope'. vitest: 21 passed.
- Req 18 — no auth header → 401: verified — status=401, body.error='Unauthorized'. vitest: 21 passed.
- Req 19 — odd digit-sum token → 401: verified — status=401, body.error='Unauthorized'. vitest: 21 passed.
- Req 20 — even digit-sum token → 200: verified — status=200. vitest: 21 passed.
- Req 21 — GET /health exempt from auth: verified — status=200 with no Authorization header. vitest: 21 passed.

## Files changed

- src/benchmark-backend/src/tests/visible/products.test.ts: Added 21 Vitest + Supertest tests covering filtering, search, sorting, pagination, combined filters, and authentication for the GET /products endpoint.

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: pass
