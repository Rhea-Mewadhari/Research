# Project

Task: task5
Target: backend

## Idea

Extend the existing product API with two new capabilities. First, mark four specific products (Laptop id=1, Ergonomic Chair id=8, Yoga Mat id=11, Clean Code id=14) as `featured: true` in the in-memory data store. Second, wire up two new query parameters: `featured` (boolean filter) and `sort=rating_desc` (sort by rating descending). The type definitions in `product.ts` are already correct — the work is purely data backfill, query parser extension, and service logic.

## Spec pointers

- `src/benchmark-backend/instructions/TASK5.md`: Full requirements covering data changes, query parser changes, service logic changes, and success criteria (pnpm test must pass including new Featured filter and Rating sort suites)

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/data/products.ts`: Add `featured: true` to products with id 1, 8, 11, 14; all others omit the field or set `featured: false`
- `src/benchmark-backend/src/utils/queryParser.ts`: Add `'rating_desc'` to `VALID_SORT_OPTIONS`; parse `featured=true`/`featured=false` and set `query.featured`
- `src/benchmark-backend/src/services/productService.ts`: Apply `featured` filter when `query.featured` is set; add `rating_desc` sort branch (sort by `rating` descending)
- `src/benchmark-backend/src/types/product.ts`: Already updated — do not modify
- `src/benchmark-backend/src/tests/visible/`: Test files — do not modify
