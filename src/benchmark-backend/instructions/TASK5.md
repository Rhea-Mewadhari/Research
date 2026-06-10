# Task 5: Write API Tests

## Objective
Write comprehensive tests for the `GET /products` endpoint using the existing Vitest + Supertest setup.

## Context

All requests to `/products` require an `Authorization: Bearer <token>` header. The benchmark token is `benchmark-token-2024`. The response is a paginated envelope:

```json
{ "data": [...], "total": 15, "page": 1, "limit": 10, "totalPages": 2 }
```

Use `res.body.data` to access the product array.

## Test Coverage Required

### Basic
- Returns products in a paginated envelope when no query parameters are provided
- Returns 401 when no auth header is sent

### Search
- Case-insensitive partial match on product name
- Search with leading/trailing whitespace still matches correctly
- Search that matches nothing returns an empty `data` array

### Category filter
- Filters to only products in the specified category
- Unknown category returns an empty `data` array

### In-stock filter
- `inStock=true` returns only products with `inStock === true`

### Sorting
- `sort=price_asc` — lowest price first
- `sort=price_desc` — highest price first
- `sort=name_asc` — alphabetical
- `sort=name_desc` — reverse alphabetical

### Combined filters
- `category` + `inStock` together return the correct intersection
- `search` + `sort` together return correctly filtered and ordered results

## Test Framework
- Use **Vitest** as the test runner
- Use **Supertest** to make HTTP requests against the Express app
- Follow the pattern used in `src/tests/visible/products.test.ts`

## Expected Files
- Add new test files to `src/tests/`

## Constraints
- Tests must be deterministic — do not depend on external state
- Do not modify application code unless a clear bug is found

## Success Criteria
- Tests run successfully with `vitest`
- Each test asserts on specific response data, not just status codes
- All edge cases listed above are covered
