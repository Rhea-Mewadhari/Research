# Project

Task: task10
Target: backend

## Idea

Fix three correctness bugs in the pagination logic of the `GET /products` endpoint. Currently: (1) `total` and `totalPages` in the paginated response always reflect the full product catalogue rather than the filtered subset, (2) at least one supported filter (`inStock` or `featured`) is applied in JavaScript after the database query rather than being pushed into the SQL query, and (3) the `totalPages` formula uses integer division (floor/truncate) instead of ceiling division, causing the last partial page to be dropped. All three bugs live in `src/services/productService.ts`.

## Spec pointers

- `src/benchmark-backend/instructions/task10.md`: defines the three bugs, requirements, technical constraints (only touch `src/services/productService.ts`), and success criteria (filtered totals, all filters in SQL, ceiling division for totalPages)

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/productService.ts`: sole file to be modified — contains filtering, SQL query construction, pagination metadata computation
- `src/benchmark-backend/src/tests/visible/pagination.test.ts`: visible test covering pagination correctness (must pass, must not be modified)
- `src/benchmark-backend/src/tests/visible/products.test.ts`: visible test covering product listing (must pass, must not be modified)
- `src/benchmark-backend/src/controllers/productController.ts`: read-only reference — shows how query params are passed to the service
- `src/benchmark-backend/src/utils/queryParser.ts`: read-only reference — shows what parsed filter shape the service receives
