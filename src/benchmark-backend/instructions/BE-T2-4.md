# Task BE-T2-4: Bug Fix — Pagination Filter-Aware Total Count

## Objective

The product listing endpoint returns paginated results, but the pagination metadata is computed incorrectly when filters are active. Fix all issues so the response accurately reflects the filtered dataset.

---

## Context

`src/services/productService.ts` builds the `getProducts` function that handles filtering, sorting, and pagination for `GET /products`. The visible tests cover the unfiltered case and currently fail on the `totalPages` boundary.

There are three related correctness issues in the pagination logic:

1. The total product count used to compute `totalPages` does not account for active query filters — it always reflects the full product catalogue
2. One of the supported filters is not applied at the database level, causing it to operate on an already-paginated slice rather than the full filtered set
3. The formula used to derive `totalPages` from the total count and page limit truncates toward zero instead of rounding up

---

## Requirements

1. `GET /products` with any active filter must return `total` and `totalPages` values that reflect the filtered dataset, not the full catalogue
2. Every supported filter (`search`, `category`, `inStock`, `featured`) must be enforced in the SQL query — not applied in JavaScript after the database returns rows
3. When the total count is not evenly divisible by the page limit, `totalPages` must round up

---

## Technical Constraints

- Modify only `src/services/productService.ts`
- Do not change `src/controllers/productController.ts`, `src/utils/queryParser.ts`, or any route files
- Do not change the existing migration SQL files

---

## Files to Investigate

- `src/services/productService.ts`

---

## Success Criteria

- All visible tests pass (`pnpm test`)
- `GET /products?category=electronics&limit=10` returns `total: 4` (not 15)
- `GET /products?featured=true&limit=3` returns exactly 3 products, all with `featured: true`
- `GET /products?inStock=true&limit=6` returns `totalPages: 2`
