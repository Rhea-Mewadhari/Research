# Task 6: Add Async Data Layer

## Objective
Replace the static product data import with an asynchronous data service, and update the service layer to handle it.

## Requirements

### 1. Async data access
- Create a function that returns the product array via a `Promise` (a `Promise.resolve()` or `setTimeout`-wrapped version is fine)
- Update `productService.ts` to `await` this function before applying filters

### 2. API behavior
- The `GET /products` endpoint must continue to respond correctly
- Response format must not change

## Constraints
- No real database or external network calls
- Keep data deterministic (same products every time)
- Do not break existing filtering and sorting behavior

## Expected Files to Modify
- `src/services/productService.ts`
- `src/data/products.ts` — or create a new data service file alongside it

## Success Criteria
- `GET /products` still returns the correct filtered and sorted data
- The data loading code uses `async`/`await`
- All visible tests pass
