# Project

Task: task10
Target: backend

## Idea

The `GET /products` endpoint has three bugs in `src/services/productService.ts` that cause incorrect pagination metadata when filters are active. First, the `COUNT(*)` query has no `WHERE` clause so `total` always reflects the full catalogue regardless of filters. Second, the `featured` filter is intentionally omitted from the SQL `WHERE` clause and instead applied in JavaScript after the paginated slice is already returned — meaning the filter operates on fewer rows than intended. Third, `totalPages` is computed with `Math.floor` instead of `Math.ceil`, so any filtered result set whose size is not evenly divisible by the page limit returns one fewer page than correct. All three bugs must be fixed inside `productService.ts` only.

## Spec pointers

- `src/benchmark-backend/instructions/task10.md`: Defines the three bugs, the single-file constraint, and the success criteria (correct `total`, `totalPages`, and all rows filtered at SQL level)

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/productService.ts`: The only file that must change — contains all three bugs in the `getProducts` function
- `src/benchmark-backend/src/tests/visible/pagination.test.ts`: Visible test file that verifies pagination behaviour (read-only, must not be modified)
- `src/benchmark-backend/src/tests/visible/products.test.ts`: Visible test file for product listing (read-only, must not be modified)
- `src/benchmark-backend/src/types/product.ts`: Defines `ProductQuery` and `PaginatedResult` types — relevant to understand the `featured` field shape
- `src/benchmark-backend/src/utils/queryParser.ts`: Parses and normalises query parameters before they reach the service — relevant to confirm how `featured` is typed/passed in
