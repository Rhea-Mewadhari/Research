# Task 6: Backend Integration Task

## Objective
Complete the `GET /products` endpoint by implementing filtering, searching, and sorting logic inside an async service layer that is already wired up and fetching real product data.

## Context

The backend already has the following infrastructure in place — **do not change it**:

- `src/services/dataFetcher.ts` — fetches products from the DummyJSON API and caches the result
- `src/middleware/auth.ts` — validates Bearer tokens via a digit-sum rule; already applied to `/products`
- `src/controllers/productController.ts` — async controller that calls the service and returns the result
- `src/utils/queryParser.ts` — parses and validates all query parameters including `page` and `limit`
- Response format is `PaginatedResponse<Product>`: `{ data, total, page, limit, totalPages }`

The `getAllProducts` function in `src/services/productService.ts` currently fetches all products but does **not** apply any filters or sorting — that is what you must implement.

## Requirements

All query parameters are optional and combinable. When no parameters are provided, return the full product list (paginated).

### Search
- `search=<string>` → filter by product name
- Case-insensitive, partial match
- Trim leading/trailing whitespace from the search value

### Category filter
- `category=<string>` → filter by category (case-insensitive exact match)

### In-stock filter
- `inStock=true` → only products where `inStock === true`

### Sorting
- `sort=price_asc` → lowest price first
- `sort=price_desc` → highest price first
- `sort=name_asc` → alphabetical
- `sort=name_desc` → reverse alphabetical

### Pipeline order
Apply in this sequence: **filter → search → sort → paginate**

## Technical Constraints
- Work only inside `src/services/productService.ts`
- Do not mutate the product array returned by `fetchAllProducts()`
- Do not change the response envelope shape
- All visible tests must pass

## Expected Files to Modify
- `src/services/productService.ts`

## Success Criteria
- All visible tests pass
- All four sort orders return correctly ordered results
- Filters and search combine correctly — none overrides another
- Auth and pagination continue to work (they are already implemented)
