# Task 5: Frontend Test Generation

## Objective

Write comprehensive tests for the product filtering and sorting functionality.

---

## Context

The application fetches products asynchronously from a backend API and renders a filterable, sortable product catalog. Filtering and sorting logic lives in `src/utils/productFilters.ts`; UI state is managed in `src/hooks/useProductFilters.ts`. Existing test coverage is incomplete — expand it to cover the cases below.

Because products load asynchronously, tests that interact with the UI must wait for the initial data load before asserting on product counts or running filter interactions. Use `await screen.findByTestId('results-count')` or `await screen.findAllByRole('heading', { level: 3 })` to wait for the loaded state before interacting.

---

## Requirements

Write tests that cover:

### 1. Rendering
- initial product list (all products visible after load)
- empty state (no products match the filter)

### 2. Search
- case-insensitive matching
- partial matches
- trimming whitespace

### 3. Category filtering
- All vs specific category

### 4. In-stock filtering
- correct inclusion/exclusion

### 5. Sorting
- price ascending/descending
- rating descending
- default ordering

### 6. Combined filters
- multiple filters applied together

### 7. Clear filters
- resets all values correctly

---

## Constraints

- Use existing test setup (Vitest + Testing Library)
- Follow current testing patterns in `tests/`
- Do not modify application logic unless necessary

---

## Expected Files

- Add or update test files in `tests/`

---

## Success Criteria

- Tests run successfully with `vitest`
- Each test asserts on specific rendered output (product names, count, order) — not just that nothing crashed
- All cases listed above are covered
- Tests are self-contained and deterministic
