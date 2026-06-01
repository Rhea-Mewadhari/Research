# Task 6: Frontend Integration Task

## Objective

Modify the application to fetch product data asynchronously instead of importing it from a static file.

---

## Context

Currently, products are imported directly from `src/data/products.ts`. Replace this with an async data loading pattern that simulates an API call.

---

## Requirements

### 1. Async data loading
- Replace the static import with a `Promise`-based function that resolves with the product array
- Simulate network latency with a short `setTimeout` delay (e.g. 300–500ms)
- Use `useEffect` + `useState` in `App.tsx` to load the data on mount

### 2. Loading state
- While data is loading, render a visible loading indicator (e.g. `<p>Loading...</p>`)

### 3. Error handling
- If the data fetch fails, display an error message in the UI

### 4. Filtering compatibility
- All existing filtering and sorting must work correctly once data has loaded

---

## Constraints

- Do not introduce real backend calls or new dependencies
- Keep data deterministic (same products every time)
- Do not break existing filtering logic

---

## Expected Files to Modify

- `src/App.tsx`
- `src/data/products.ts` — or create `src/services/productService.ts` alongside it

---

## Success Criteria

- Products load via `async`/`await` or a Promise chain
- A loading indicator is visible while data is being fetched
- An error state is shown if the fetch fails
- Filtering and sorting work correctly after data loads
- Existing visible tests pass (you may need to mock the async call in tests)
