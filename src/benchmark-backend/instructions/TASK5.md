# Task 5: Data & Model Update — Featured Products + Rating Sort

## Objective

Extend the product API with two new capabilities: a `featured` filter and a `rating_desc` sort option. The type definitions have already been updated — your job is to backfill the data, wire through the query parser, implement the service logic, and make the tests pass.

---

## Context

The `Product` interface now includes an optional `featured` boolean field. Four products should be marked as featured. The `SortOption` type already includes `'rating_desc'`.

The frontend will use these two new query parameters:

| Parameter | Values | Behaviour |
|---|---|---|
| `featured` | `true` / `false` | Filter to featured (or non-featured) products |
| `sort=rating_desc` | — | Sort by `rating` field, highest first |

---

## Requirements

### 1. Data — mark featured products

In `src/data/products.ts`, set `featured: true` on **four** products:

- Laptop (id 1)
- Ergonomic Chair (id 8)
- Yoga Mat (id 11)
- Clean Code (id 14)

All other products default to not featured (omit the field or set `featured: false`).

### 2. Query parser — parse new parameters

In `src/utils/queryParser.ts`:

- Parse `featured=true` / `featured=false` from the query string and set `query.featured` accordingly
- Add `'rating_desc'` to the list of valid sort options so it is not silently dropped

### 3. Service — apply new filter and sort

In `src/services/productService.ts`:

- When `query.featured` is set, filter results to products where `(p.featured ?? false) === query.featured`
- When `query.sort === 'rating_desc'`, sort results by `rating` descending

---

## Expected Files to Modify

- `src/data/products.ts`
- `src/utils/queryParser.ts`
- `src/services/productService.ts`

Do **not** modify `src/types/product.ts` — the type definitions are already correct.

---

## Success Criteria

- `pnpm test` passes, including the new `Featured filter` and `Rating sort` test suites
- `featured=true` returns exactly 4 products, all with `featured === true`
- `featured=false` returns the remaining 11 products
- `sort=rating_desc` returns all products sorted highest-rating-first
- Existing filter, sort, pagination, and auth tests continue to pass
