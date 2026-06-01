# Task 1: Implement Product Filtering API

## Objective
Complete the `GET /products` endpoint by implementing filtering, searching, and sorting logic in the service layer.

## Requirements

All query parameters are optional and combinable. When no parameters are provided, return the full product list unmodified.

### Search
- `search=<string>` → filter by product name
- Matching must be case-insensitive and support partial matches
- Leading and trailing whitespace in the search value should not affect matching

### Filtering
- `category=<string>` → filter by category (case-insensitive exact match)
- `inStock=<true|false>` → filter to products where `inStock === true` when the value is `"true"`
  - Note: query parameters arrive as strings — `"true"` is truthy, `"false"` is not

### Sorting
- `sort=price_asc` → lowest price first
- `sort=price_desc` → highest price first
- `sort=name_asc` → alphabetical by name
- `sort=name_desc` → reverse alphabetical by name

## Technical Constraints
- Apply filters and search before sorting
- Do not mutate the original product array
- Filtering logic belongs in `src/services/productService.ts`

## Expected Files to Modify
- `src/services/productService.ts`

## Example
```
GET /products?category=electronics&inStock=true&sort=price_asc
```

## Success Criteria
- All visible tests pass
- All four sort orders return correctly ordered results
- Filters and search can be combined without any one overriding another
