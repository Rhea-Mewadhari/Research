# Task 3: Test Generation — Product API

## Objective

Write comprehensive tests for the `GET /products` endpoint.

---

## Context

The backend is fully implemented and working. The product API supports filtering, sorting, pagination, and Bearer token authentication. Your job is to write tests that thoroughly cover the endpoint's behaviour.

The endpoint is at `GET /products` and requires `Authorization: Bearer <token>` where the token's digits must sum to an even number (e.g. `Bearer benchmark-token-2024`).

Products are returned in a paginated envelope:

```json
{ "data": [...], "total": 15, "page": 1, "limit": 10, "totalPages": 2 }
```

---

## Requirements

Write tests that cover:

### 1. Filtering
- Filter by `category` (exact match, case-insensitive)
- Filter by `inStock=true` and `inStock=false`
- Unknown category returns empty data array

### 2. Search
- Case-insensitive name matching
- Partial matches
- Whitespace trimming

### 3. Sorting
- `sort=price_asc` — lowest price first
- `sort=price_desc` — highest price first
- `sort=name_asc` — alphabetical
- `sort=name_desc` — reverse alphabetical

### 4. Pagination
- Correct envelope shape (`data`, `total`, `page`, `limit`, `totalPages`)
- Different pages return different products
- `limit` is clamped to a maximum of 50

### 5. Combined filters
- Multiple query params applied together

### 6. Authentication
- Missing auth header → 401
- Invalid token (odd digit sum) → 401
- Valid token (even digit sum) → 200
- `/health` does not require auth

---

## Constraints

- Use the existing test setup: Vitest + Supertest
- Mock `fetchAllProducts` using `vi.mock` — do not call the real external API
- Follow the patterns already present in `src/tests/visible/products.test.ts`
- Do not modify any application source files

---

## Expected Files to Modify

- `src/tests/visible/products.test.ts` — write your tests here

---

## Success Criteria

- All tests pass with `vitest`
- Each test asserts on specific response values — not just that the status is 200
- All areas listed above are covered
- Tests are self-contained and deterministic
