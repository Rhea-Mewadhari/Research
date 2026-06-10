# Task 6: Frontend Integration Task

## Objective

Implement the filtering and sorting feature for a product catalog that loads data asynchronously from a backend API.

---

## Context

The application already fetches product data asynchronously from a backend at `http://localhost:3000/products`. The data loading, loading state, error state, and pagination UI are all in place. Your job is to wire up the filtering and sorting logic so that it works correctly with the already-loaded async data.

Products arrive in a paginated envelope: `{ data: Product[], total, page, limit, totalPages }`.

---

## Requirements

### 1. Filtering and sorting
Implement the `filterProducts` function in `src/utils/productFilters.ts` so that it correctly:

- Filters by name (case-insensitive, trims whitespace)
- Filters by category (exact match; `"All"` means no filter)
- Filters by in-stock status
- Sorts by price ascending/descending or rating descending
- Applies sort **after** filtering; does **not** mutate the input array

### 2. Filter controls
Wire up the event handlers in `src/components/FilterPanel.tsx` and `src/components/SortSelect.tsx` so that user interactions update filter state:

- Search input updates `filters.search`
- Category dropdown updates `filters.category`
- In-stock checkbox updates `filters.inStockOnly`
- Sort dropdown updates `filters.sortBy`
- Clear Filters button resets all fields to their defaults

### 3. Dynamic categories
The category dropdown must be populated from the categories present in the loaded product data — **not** a hardcoded list. `App.tsx` already derives a `categories` array from the fetched products and passes it to `FilterPanel` as a prop.

### 4. Pagination reset on filter change
When any filter is changed, reset the page back to 1. Otherwise, the user might be on page 3 and see an empty result because the filtered list is shorter.

---

## Technical Constraints

- Do not modify the data-fetching logic (`src/api/productsApi.ts`, `src/hooks/useProductFilters.ts`)
- Do not change the `PaginatedResponse<T>` structure
- Do not add new dependencies
- The app must build and all visible tests must pass

---

## Expected Files to Modify

- `src/utils/productFilters.ts` — implement filterProducts
- `src/components/FilterPanel.tsx` — wire up onChange handlers
- `src/components/SortSelect.tsx` — wire up onChange handler

---

## Success Criteria

1. All visible tests pass
2. Filtering, sorting, and clear all work correctly in the browser
3. Category options derive from the loaded product data (not hardcoded)
4. Changing any filter resets back to page 1
