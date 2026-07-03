# Task BE-T2-1: Bug Fix — Compare Endpoint Returns 404

## Objective

The `GET /api/products/compare` endpoint is returning 404 for all requests. Identify the root cause and fix it so the endpoint responds correctly.

---

## Context

The backend exposes two endpoints under `/api/products`:

- `GET /api/products/compare?ids=1,2` — returns a side-by-side comparison of multiple products
- `GET /api/products/:id` — returns a single product by its ID

Both are registered in `src/routes/apiProductRoutes.ts`. After a recent change to that file, requests to `/api/products/compare` are returning 404 instead of the expected comparison result.

---

## Requirements

1. `GET /api/products/compare?ids=1,2` returns HTTP 200 with a `products` array and a `count`
2. `GET /api/products/compare?ids=1` returns HTTP 400 (fewer than two IDs supplied)
3. `GET /api/products/:id` continues to return the correct product for a valid ID
4. `GET /api/products/:id` continues to return 404 for a non-existent ID

---

## Technical Constraints

- The fix belongs in the routing layer — controllers should not contain logic that compensates for route registration order
- Do not modify `src/controllers/compareController.ts`, `src/controllers/productController.ts`, or `src/services/compareService.ts`
- Do not modify `src/schemas/productSchema.ts`

---

## Expected Files to Modify

- `src/routes/apiProductRoutes.ts`

---

## Success Criteria

- All visible tests pass (`pnpm test`)
- `GET /api/products/compare?ids=1,2` returns 200 with a `products` array of length 2
- `GET /api/products/compare?ids=1` returns 400
- `GET /api/products/:id` still works for valid and non-existent product IDs
