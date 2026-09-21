# Milestone

Task: task7
Target: backend

## Requirements addressed

- Req 1 — `GET /api/products/compare?ids=1,2` returns HTTP 200 with `products` array of length 2 and `count` of 2: verified — compare.test.ts "returns 200 with matching products for two valid ids" PASSED (all 22 tests passed)
- Req 2 — `GET /api/products/compare?ids=1` returns HTTP 400: verified — compare.test.ts "returns 400 when fewer than two ids are provided" PASSED
- Req 3 — Each product in compare response includes truthy `id` and `name`: verified — compare.test.ts "includes id and name in each returned product" PASSED
- Req 4 — `GET /api/products/:id` with valid ID still returns HTTP 200 (no regression): verified — all 22 tests passed, `/:id` route remains registered at line 10 of apiProductRoutes.ts
- Req 5 — `GET /api/products/:id` with non-existent ID still returns HTTP 404 (no regression): verified — all 22 tests passed, productController unchanged
- Req 6 — Fix confined to `src/routes/apiProductRoutes.ts`; `/compare` registered before `/:id`: verified — line 9 is `router.get('/compare', ...)`, line 10 is `router.get('/:id', ...)`; no other source files modified

## Files changed

- `src/benchmark-backend/src/routes/apiProductRoutes.ts`: moved `router.get('/compare', ...)` before `router.get('/:id', ...)` to fix Express route-order bug causing 404 on the compare endpoint

## Checks

- pnpm test: 22 passed, 0 failed (2 test files)
- pnpm run build: pass
