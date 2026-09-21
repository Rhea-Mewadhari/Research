# Project

Task: task7
Target: backend

## Idea

The `GET /api/products/compare` endpoint is returning 404 because the route for `/:id` is registered before `/compare` in `apiProductRoutes.ts`. Express matches routes in registration order, so requests to `/compare` are intercepted by the `/:id` handler (with `id = "compare"`), which then returns 404 when no product with that ID exists. The fix is to register the `/compare` route before the `/:id` route.

## Spec pointers

- `benchmark-backend/instructions/task7.md`: Describes the 404 bug on the compare endpoint, lists requirements for HTTP 200/400 responses, and specifies that the fix belongs in the routing layer only — controllers must not be modified.

## Affected areas (initial read, not final)

- `src/routes/apiProductRoutes.ts`: The only file that needs to change — swap `/compare` and `/:id` route registration order so Express matches the static `/compare` path before the dynamic `/:id` parameter.
- `src/controllers/compareController.ts`: Read-only reference — handles the compare logic; must not be modified.
- `src/controllers/productController.ts`: Read-only reference — handles single product lookup; must not be modified.
- `src/services/compareService.ts`: Read-only reference — contains compare business logic; must not be modified.
- `src/schemas/productSchema.ts`: Read-only reference — validation schemas for both routes; must not be modified.
- `src/tests/visible/`: Visible test files that must pass but must not be modified.
