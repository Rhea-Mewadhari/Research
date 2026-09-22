# Project

Task: task10
Target: backend

## Idea

The `getProducts` function in `productService.ts` has three bugs related to pagination when filters are active: (1) the COUNT query always counts all products instead of applying the WHERE filters, so `total` is always the full catalogue size; (2) the `featured` filter is not included in the SQL WHERE clause — it is applied in JavaScript after the paginated slice is already fetched, meaning it filters the wrong subset; (3) `totalPages` is computed with `Math.floor` instead of `Math.ceil`, causing it to round down when the total is not evenly divisible by the page limit. All three bugs must be fixed in `productService.ts` only.

## Spec pointers

- `src/benchmark-backend/instructions/task10.md`: full task description — objectives, requirements, constraints, success criteria
- `src/benchmark-backend/src/services/productService.ts`: the single file to modify; contains all three bugs with inline comments marking each one

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/productService.ts`: the only file that needs to change — fix COUNT query to include WHERE clause, add `featured` filter to SQL WHERE, change `Math.floor` to `Math.ceil`
- `src/benchmark-backend/src/tests/visible/pagination.test.ts`: visible tests that must pass after the fix (read-only)
- `src/benchmark-backend/src/tests/visible/products.test.ts`: visible tests that must pass after the fix (read-only)
