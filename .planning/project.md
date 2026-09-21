# Project

Task: task7
Target: backend

## Idea

The `GET /api/products/compare` endpoint is returning 404 because of a route registration order bug in `src/routes/apiProductRoutes.ts`. Express matches routes in the order they are declared; the wildcard `/:id` route is currently registered before the static `/compare` route, so every request to `/compare` is intercepted by `/:id` and "compare" is treated as a product ID (which doesn't exist), causing a 404. The fix is simply to move the `/compare` route registration above the `/:id` route.

## Spec pointers

- `benchmark-backend/instructions/task7.md`: defines the bug, the four requirements (200 on valid compare, 400 on insufficient IDs, 200 on valid :id, 404 on missing :id), the constraint to fix only the routing layer, and the single file to modify

## Affected areas (initial read, not final)

- `src/routes/apiProductRoutes.ts`: route registration order is the root cause — `/compare` must appear before `/:id`
- `src/controllers/compareController.ts`: must not be modified (read-only reference)
- `src/controllers/productController.ts`: must not be modified (read-only reference)
- `src/services/compareService.ts`: must not be modified (read-only reference)
- `src/schemas/productSchema.ts`: must not be modified (read-only reference)
- `src/tests/visible/`: visible test suite that must pass after the fix
