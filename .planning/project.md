# Project

Task: task5
Target: backend

## Idea

Extend the existing product API with two new query capabilities: a `featured` boolean filter and a `rating_desc` sort option. The `Product` interface and `ProductQuery` type already include the relevant fields (`featured?: boolean` and `'rating_desc'` in `SortOption`). The work is to: (1) mark four specific products as featured in the data layer, (2) wire the two new query parameters through the query parser so they are not silently dropped, and (3) implement the filter and sort logic in the service layer.

## Spec pointers

- `src/benchmark-backend/instructions/TASK5.md`: Full requirements — which products to mark as featured, how to parse the new query params, and how to apply the filter and sort in the service.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/data/products.ts`: Add `featured: true` to products id 1 (Laptop), 8 (Ergonomic Chair), 11 (Yoga Mat), 14 (Clean Code).
- `src/benchmark-backend/src/utils/queryParser.ts`: Add `'rating_desc'` to `VALID_SORT_OPTIONS`; parse `featured=true/false` from the raw query string into `query.featured`.
- `src/benchmark-backend/src/services/productService.ts`: Apply featured filter (`(p.featured ?? false) === query.featured`) and `rating_desc` sort (descending by `rating`) when the respective query fields are set.
- `src/benchmark-backend/src/types/product.ts`: Read-only reference — already correct, do not modify.
- `src/benchmark-backend/src/tests/visible/products.test.ts`: Read-only reference — tests drive the success criteria.
