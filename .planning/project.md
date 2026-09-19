# Project

Task: task5
Target: backend

## Idea

Extend the existing Express/TypeScript product API with two new capabilities: a `featured` boolean filter and a `rating_desc` sort option. The `Product` interface and `ProductQuery` type already declare the `featured` optional field and `'rating_desc'` as a valid `SortOption` — the implementation gap is in the data layer (no products are marked featured yet), the query parser (doesn't parse `featured` or allow `rating_desc`), and the service layer (neither filter nor sort is applied). The task is to backfill four specific products with `featured: true`, wire the new query parameter through the parser, and implement the filter and sort in the service function.

## Spec pointers

- `src/benchmark-backend/instructions/TASK5.md`: Full requirements — which products to mark featured, how to parse `featured` query param, how to apply the filter (`p.featured ?? false`) and the `rating_desc` sort; also lists the three files to modify and the success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/data/products.ts`: Needs `featured: true` added to products id 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), and 14 (Clean Code).
- `src/benchmark-backend/src/utils/queryParser.ts`: Needs `'rating_desc'` added to `VALID_SORT_OPTIONS` and a new block to parse `featured=true`/`featured=false` from the raw query string.
- `src/benchmark-backend/src/services/productService.ts`: Needs a featured filter block (`p.featured ?? false`) and a `rating_desc` sort branch (`b.rating - a.rating`).
- `src/benchmark-backend/src/types/product.ts`: Read-only — already correct, do not touch.
- `src/benchmark-backend/src/tests/visible/products.test.ts`: Read-only — contains the new `Featured filter` and `Rating sort` test suites that must pass.
