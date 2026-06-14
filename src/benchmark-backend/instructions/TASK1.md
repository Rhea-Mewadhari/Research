# Task 1: Integration — Align Backend API Contract with Frontend

## Objective

Resolve the contract mismatches between the frontend product catalog and the backend `GET /products` endpoint so that the two systems work together correctly.

---

## Context

The frontend and backend were developed by separate teams. The frontend has recently been updated, and its API client now sends sort values in a different format and expects different field names in the response envelope. The backend has not been updated to match.

The frontend API client (`src/api/productsApi.ts` in the frontend repo) sends requests in this shape:

```
GET /products?sort=price-asc&page=1
Authorization: Bearer benchmark-token-2024
```

And expects responses in this shape:

```json
{
  "data": [...],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

## Mismatches to Fix

### 1. Sort parameter format

The frontend sends hyphenated sort values:

| Frontend sends | Meaning |
|---|---|
| `price-asc` | lowest price first |
| `price-desc` | highest price first |
| `rating-desc` | highest rating first |

The backend currently only recognises camelCase sort values (`priceAsc`, `priceDesc`, `ratingDesc`) and silently ignores anything else. Sort requests from the frontend are dropped.

**Fix:** update `src/utils/queryParser.ts` to accept the frontend's hyphenated format, and ensure `src/services/productService.ts` handles `rating-desc` sorting correctly.

### 2. Response envelope field names

The backend currently returns `count` and `pages` in the response envelope. The frontend expects `total` and `totalPages`.

**Fix:** update `src/services/productService.ts` to return the correct field names.

---

## Technical Constraints

- Do not modify `src/middleware/auth.ts` or the auth logic
- Do not change the `Product` data shape
- All existing filters (search, category, inStock) must continue to work
- The fix must be backward-compatible: other valid sort values should still work

---

## Expected Files to Modify

- `src/utils/queryParser.ts` — accept frontend sort format
- `src/services/productService.ts` — fix response envelope field names, ensure rating-desc sort is handled

---

## Success Criteria

- `GET /products?sort=price-asc` returns products sorted by price ascending
- `GET /products?sort=price-desc` returns products sorted by price descending
- `GET /products?sort=rating-desc` returns products sorted by rating descending
- Response envelope contains `total` and `totalPages` (not `count` and `pages`)
- All visible tests pass
