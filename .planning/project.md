# Project

Task: task7
Target: backend

## Idea

The `GET /api/products/compare` endpoint is returning 404 for all requests because in `src/routes/apiProductRoutes.ts` the dynamic route `/:id` is registered before the static route `/compare`. Express matches routes in registration order, so requests to `/compare` are captured by `/:id` with `id = "compare"`, which finds no product and returns 404. The fix is to reorder the route registrations so `/compare` is registered before `/:id`.

## Spec pointers

- `benchmark-backend/instructions/task7.md`: Describes the bug (compare endpoint returning 404), the requirements (200 with products array, 400 for <2 ids, /:id still works), constraints (fix belongs in routing layer only, do not modify controllers or services), and the expected file to modify (`src/routes/apiProductRoutes.ts`).

## Affected areas (initial read, not final)

- `src/routes/apiProductRoutes.ts`: The only file to modify — swap the order of `router.get('/compare', ...)` and `router.get('/:id', ...)` so the static route is registered first.
- `src/controllers/compareController.ts`: Read-only reference to understand what the compare route does (not to be modified).
- `src/controllers/productController.ts`: Read-only reference for the /:id route (not to be modified).
- `src/schemas/productSchema.ts`: Read-only — defines `productIdSchema` and `compareQuerySchema` used in route validation (not to be modified).
- `src/tests/visible/`: Visible test suite that must pass after the fix.
