# Project

Task: task7
Target: backend

## Idea

The `GET /api/products/compare` endpoint returns 404 for all requests because the route for the dynamic segment `/:id` is registered before the static `/compare` route in `apiProductRoutes.ts`. Express matches routes in registration order, so `/compare` is intercepted by `/:id` (with `id = "compare"`) and the compare handler is never reached. The fix is to reorder the route registrations so `/compare` is declared before `/:id`.

## Spec pointers

- `benchmark-backend/instructions/task7.md`: Describes the 404 bug on `/api/products/compare`, requirements for HTTP 200/400 responses, constraints (fix only in routing layer, do not modify controllers/services/schema), and specifies `src/routes/apiProductRoutes.ts` as the only file to modify.

## Affected areas (initial read, not final)

- `src/routes/apiProductRoutes.ts`: The only file to change — move the `/compare` route registration above the `/:id` route registration.
- `src/controllers/compareController.ts`: Read-only reference — handles compare logic; must not be modified.
- `src/controllers/productController.ts`: Read-only reference — handles single-product lookup; must not be modified.
- `src/services/compareService.ts`: Read-only reference — business logic for comparison; must not be modified.
- `src/schemas/productSchema.ts`: Read-only reference — validation schemas; must not be modified.
- `src/tests/visible/`: Visible tests that must pass after the fix.
