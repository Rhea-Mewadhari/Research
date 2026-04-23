# Task 1: Frontend Feature Implementation

## Objective

Implement the missing frontend feature for the product catalog application.

The application already renders a catalog of products. Your job is to complete the filtering and sorting feature so that users can:

- search products by name
- filter by category
- filter to in-stock products only
- sort results by price or rating
- clear all filters back to their defaults

The solution must satisfy the existing automated tests.

---

## Functional Requirements

### 1. Search
- The search input must filter products by `name`
- Matching must be case-insensitive
- Partial matches must work
- Leading and trailing whitespace in the search input should not affect matching

Examples:
- `mouse` should match `Wireless Mouse`
- `  lamp ` should match `Desk Lamp`

### 2. Category filter
- The category dropdown must support:
  - `All`
  - `Electronics`
  - `Fitness`
  - `Accessories`
- Selecting `All` should show products from every category
- Selecting a specific category should only show matching products

### 3. In-stock filter
- When the in-stock checkbox is checked, only products with `inStock === true` should be shown

### 4. Sorting
The sort dropdown must support:
- `default` → preserve original product order
- `price-asc` → lowest price first
- `price-desc` → highest price first
- `rating-desc` → highest rating first

### 5. Clear filters
The `Clear filters` button must reset all filter state back to:
- search = empty string
- category = `All`
- inStockOnly = false
- sortBy = `default`

### 6. Empty state
If no products match the current filters, the UI must display:
- `No products found.`

---

## Technical Constraints

- Do not add new dependencies
- Do not change the product dataset
- Do not remove existing components
- Keep the current TypeScript types intact unless a small change is absolutely necessary
- Prefer implementing the feature inside the existing files rather than restructuring the app
- The app must build and the tests must pass

---

## Expected Files to Modify

You will most likely need to modify:
- `src/utils/productFilters.ts`
- `src/components/FilterPanel.tsx`
- `src/components/SortSelect.tsx`

You may also make small changes in:
- `src/App.tsx`

---

## Behavior Notes

- Filters should combine together correctly
- Sorting should apply after filtering
- Avoid mutating the original input array when sorting
- Keep the controls accessible through their labels

---

## Success Criteria

Your solution is considered correct when:
1. all visible tests pass
2. the feature works manually in the browser
3. combined filtering and reset behavior work correctly
4. the original product array is not mutated during filtering/sorting