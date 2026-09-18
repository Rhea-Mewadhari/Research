# Milestone

Task: task3
Target: backend

## Requirements addressed
- Req 1 (category=electronics filter): verified — Test 'filters by category=electronics' passed: res.status===200, res.body.total===4, every element has category==='electronics'. vitest run: 20 passed (20).
- Req 2 (category=ELECTRONICS case-insensitive): verified — Test 'filters by category=ELECTRONICS (case-insensitive)' passed: res.body.total===4 and every element has category==='electronics'. vitest run: 20 passed (20).
- Req 3 (inStock=true filter): verified — Test 'filters by inStock=true' passed: res.body.total===11 and res.body.data.every(p => p.inStock===true). vitest run: 20 passed (20).
- Req 4 (inStock=false filter): verified — Test 'filters by inStock=false' passed: res.body.total===4 and res.body.data.every(p => p.inStock===false). vitest run: 20 passed (20).
- Req 5 (nonexistent category): verified — Test 'returns empty for nonexistent category' passed: res.body.total===0 and res.body.data.length===0. vitest run: 20 passed (20).
- Req 6 (search=LAPTOP case-insensitive): verified — Test 'searches LAPTOP case-insensitively' passed: res.body.total===1 and res.body.data[0].name==='Laptop'. vitest run: 20 passed (20).
- Req 7 (search=phone partial match): verified — Test 'searches by partial match "smart"' passed: res.body.total===1 and res.body.data[0].name==='Smartphone'. vitest run: 20 passed (20).
- Req 8 (search=%20laptop%20 whitespace trim): verified — Test 'trims whitespace in search query' passed: res.body.total===1 and res.body.data[0].name==='Laptop'. vitest run: 20 passed (20).
- Req 9 (sort=price_asc): verified — Test 'sorts by price_asc' passed: res.body.data[0].name==='Jump Rope' and res.body.data[0].price===19. vitest run: 20 passed (20).
- Req 10 (sort=price_desc): verified — Test 'sorts by price_desc' passed: res.body.data[0].name==='Laptop' and res.body.data[0].price===999. vitest run: 20 passed (20).
- Req 11 (sort=name_asc): verified — Test 'sorts by name_asc' passed: res.body.data[0].name==='Bookshelf'. vitest run: 20 passed (20).
- Req 12 (sort=name_desc): verified — Test 'sorts by name_desc' passed: res.body.data[0].name==='Yoga Mat'. vitest run: 20 passed (20).
- Req 13 (default pagination envelope): verified — Test 'returns correct envelope on default request' passed: data.length===10, total===15, page===1, limit===10, totalPages===2. vitest run: 20 passed (20).
- Req 14 (page=2 pagination): verified — Test 'page=2 returns remaining products with no ID overlap' passed: data.length===5, page===2, no ID overlap with page 1. vitest run: 20 passed (20).
- Req 15 (limit=100 clamped to 50): verified — Test 'clamps limit to maximum of 50' passed: res.body.limit===50 and res.body.data.length===15. vitest run: 20 passed (20).
- Req 16 (combined category+inStock filters): verified — Test 'combines category and inStock filters' passed: res.body.total===3 and every item has category==='electronics' && inStock===true. vitest run: 20 passed (20).
- Req 17 (no auth header → 401): verified — Test 'returns 401 with no Authorization header' passed: res.status===401 and res.body.error==='Unauthorized'. vitest run: 20 passed (20).
- Req 18 (odd-digit-sum token → 401): verified — Test 'returns 401 with odd-digit-sum token' passed: res.status===401 and res.body.error==='Unauthorized'. vitest run: 20 passed (20).
- Req 19 (valid even-digit-sum token → 200): verified — Test 'returns 200 with valid even-digit-sum token' passed: res.status===200. vitest run: 20 passed (20).
- Req 20 (/health skips auth → 200): verified — Test '/health does not require auth' passed: res.status===200 and res.body.status==='ok'. vitest run: 20 passed (20).

## Files changed
- `src/benchmark-backend/src/tests/visible/products.test.ts`: added 20 Vitest + Supertest tests covering category/inStock filtering, case-insensitive/partial/trimmed search, all four sort options, pagination envelope and clamping, combined query params, and Bearer token authentication

## Checks
- pnpm test: 20 passed, 0 failed
- pnpm run build: pass
