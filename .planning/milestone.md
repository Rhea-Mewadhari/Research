# Milestone

Task: task7
Target: backend

## Requirements addressed

- Req 1 — `GET /api/products/compare?ids=1,2` returns HTTP 200 with `products` array of length 2 and `count` equal to 2: verified — compare.test.ts "returns 200 with matching products for two valid ids" PASSED (8ms); 2 test files, 22 tests, all passed.
- Req 2 — Each product in `products` contains at least `id` and `name` fields: verified — compare.test.ts "includes id and name in each returned product" PASSED (1ms).
- Req 3 — `GET /api/products/compare?ids=1` (fewer than two IDs) returns HTTP 400: verified — compare.test.ts "returns 400 when fewer than two ids are provided" PASSED (1ms).
- Req 4 — `GET /api/products/:id` with a valid numeric ID returns HTTP 200: verified — products.test.ts fully passed, all 19 tests green, no regressions on `/:id` route.
- Req 5 — `GET /api/products/:id` with a non-existent ID returns HTTP 404: verified — products.test.ts fully passed, 404 behaviour for unknown IDs preserved.
- Req 6 — Only `src/routes/apiProductRoutes.ts` is modified: verified — file content inspection confirmed controllers, services, and schemas are unchanged; apiProductRoutes.ts is the sole changed file.
- Req 7 — `/compare` route registered before `/:id` in `apiProductRoutes.ts`: verified — line 9 is `router.get('/compare', ...)`, line 10 is `router.get('/:id', ...)`.

## Files changed

- `src/benchmark-backend/src/routes/apiProductRoutes.ts`: Moved `router.get('/compare', ...)` to appear before `router.get('/:id', ...)` so Express matches the static segment first.

## Checks

- pnpm test: 22 passed, 0 failed (2 test files: compare.test.ts, products.test.ts)
- pnpm run build: pass
