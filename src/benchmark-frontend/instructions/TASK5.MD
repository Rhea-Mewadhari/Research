# Task 5: Frontend Test Generation

## Objective

Write comprehensive integration tests for the product filtering, sorting, and UI behaviour.

---

## Context

The app fetches products from a backend API, then filters and sorts them client-side. Filtering logic is in `src/utils/productFilters.ts`; UI state is in `src/hooks/useProductFilters.ts`; the root component is `src/App.tsx`.

**All 6 test files are empty stubs — write every test from scratch.**

---

## Mock setup (already in place — do not add your own)

`tests/setup.ts` stubs `global.fetch` before every test to return all 15 products from `src/data/products.ts`. You do **not** need to mock `fetch` or set up any providers.

The stub response shape is:
```json
{ "data": [...products], "total": 15, "page": 1, "limit": 15, "totalPages": 1 }
```

---

## Async pattern — REQUIRED

Products load asynchronously on mount. **Always wait for the initial load before interacting or asserting:**

```tsx
render(<App />);
await screen.findByTestId('results-count');   // wait for fetch to resolve
// now safe to interact / assert
```

---

## Product fixture quick-reference

These values come from `src/data/products.ts` and will match what renders during tests:

- **Total:** 15 products
- **Categories:** Electronics (5), Fitness (5), Accessories (5)
- **Out of stock (4):** USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp
- **In stock:** 11
- **Highest rated:** Yoga Mat (4.8), then Mechanical Keyboard (4.7)
- **Cheapest:** Jump Rope ($15) · **Most expensive:** Noise-Cancelling Headphones ($149)

---

## Test files to fill in

| File | Area |
|---|---|
| `tests/app.render.test.tsx` | Initial render, result count |
| `tests/filtering.test.tsx` | Search, category, in-stock, combined |
| `tests/sorting.test.tsx` | price-asc, price-desc, rating-desc, default |
| `tests/clearFilters.test.tsx` | Clear button resets filters |
| `tests/pagination.test.tsx` | Prev/Next button states |
| `tests/loadingError.test.tsx` | Loading spinner, fetch error |

---

## Constraints

- Import `App` from `'../src/App'`
- Use `@testing-library/react` and `@testing-library/user-event`
- Do **not** modify any file in `src/`

---

## Success Criteria

- `pnpm test` passes with no errors
- Each test asserts on specific rendered output (product names, counts, order) — not just that nothing crashed
- All areas in the table above are covered
