# Project

Task: task7
Target: backend

## Idea

The `GET /api/products/compare` endpoint returns 404 because Express route registration order causes the dynamic `/:id` route to match the literal string "compare" before the `/compare` route ever gets a chance. The fix is purely in the routing layer: register `/compare` before `/:id` so Express resolves the specific static route first.

## Spec pointers

- `benchmark-backend/instructions/task7.md`: Defines the bug, its root cause location (`src/routes/apiProductRoutes.ts`), the four requirements (compare 200, compare 400, id 200, id 404), and the single expected file to modify.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/routes/apiProductRoutes.ts`: The only file to change — swap route registration order so `/compare` appears before `/:id`.
- `src/benchmark-backend/src/controllers/compareController.ts`: Read-only reference; handles the compare endpoint logic (must not be modified).
- `src/benchmark-backend/src/controllers/productController.ts`: Read-only reference; handles the single-product endpoint (must not be modified).
- `src/benchmark-backend/src/schemas/productSchema.ts`: Read-only reference; defines validation schemas for both routes (must not be modified).
