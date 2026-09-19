# Project

Task: task5
Target: backend

## Idea

Extend the existing product API with two new capabilities: a `featured` boolean filter and a `rating_desc` sort option. This involves three coordinated changes: marking four specific products as featured in the data layer (`products.ts`), teaching the query parser to recognise the `featured` and `rating_desc` query parameters (`queryParser.ts`), and implementing the corresponding filter and sort logic in the service layer (`productService.ts`). The type definitions (`Product` interface and `SortOption` type) are already updated and must not be touched.

## Spec pointers

- `src/benchmark-backend/instructions/TASK5.md`: Full task specification — data changes, query parser changes, service logic changes, success criteria, and the list of files to modify.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/data/products.ts`: Add `featured: true` to products with id 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), 14 (Clean Code); all others omit the field or use `featured: false`.
- `src/benchmark-backend/src/utils/queryParser.ts`: Parse `featured=true`/`featured=false` from the query string into `query.featured`; add `'rating_desc'` to the valid sort options list.
- `src/benchmark-backend/src/services/productService.ts`: Apply `featured` filter when `query.featured` is set (`(p.featured ?? false) === query.featured`); apply `rating` descending sort when `query.sort === 'rating_desc'`.
- `src/benchmark-backend/src/types/product.ts`: Read-only — already has the `featured` field on `Product` and `'rating_desc'` on `SortOption`; do not modify.
- `src/benchmark-backend/src/tests/visible/products.test.ts`: Read-only test file — must pass after changes, including new `Featured filter` and `Rating sort` suites.
