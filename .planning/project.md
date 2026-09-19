# Project

Task: task5
Target: backend

## Idea

Extend the product API with two new capabilities: a `featured` boolean filter and a `rating_desc` sort option. The type definitions (`Product` interface with optional `featured` field, and `SortOption` including `'rating_desc'`) are already in place. The work is to backfill four products in the data store with `featured: true` (Laptop/id1, Ergonomic Chair/id8, Yoga Mat/id11, Clean Code/id14), update the query parser to recognise `featured=true/false` and `sort=rating_desc`, and add the corresponding filter/sort logic in the product service.

## Spec pointers

- `src/benchmark-backend/instructions/TASK5.md`: Full task description — data changes, query parser requirements, service logic, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/data/products.ts`: Add `featured: true` to four specific products (ids 1, 8, 11, 14)
- `src/benchmark-backend/src/utils/queryParser.ts`: Parse `featured` boolean query param; add `rating_desc` as a valid sort option
- `src/benchmark-backend/src/services/productService.ts`: Apply featured filter (`(p.featured ?? false) === query.featured`) and rating_desc sort (by `rating` descending)
- `src/benchmark-backend/src/types/product.ts`: Read-only reference — already updated, do not modify
- `src/benchmark-backend/src/tests/visible/products.test.ts`: Read-only reference — the new test suites that must pass
