# Milestone

Task: task1
Target: frontend

## Requirements addressed

- Req 1 (search filter — case-insensitive partial match): verified — `tests/filtering.test.tsx > Filtering behavior > filters products by search term` PASSED (86ms)
- Req 2 (category filter — exact match / pass-through for 'All'): verified — `tests/filtering.test.tsx > Filtering behavior > filters products by category` PASSED (26ms)
- Req 3 (in-stock filter — excludes inStock=false when inStockOnly=true): verified — `tests/filtering.test.tsx > Filtering behavior > filters products by in-stock only` PASSED (23ms)
- Req 4 (sort price-asc — exact order over full unfiltered set): verified — `tests/sorting.test.tsx > Sorting behavior > sorts by price ascending` PASSED (85ms)
- Req 5 (sort price-desc — first Noise-Cancelling Headphones, last Jump Rope): verified — `tests/sorting.test.tsx > Sorting behavior > sorts by price descending` PASSED (30ms)
- Req 6 (sort rating-desc — first Yoga Mat, second Mechanical Keyboard): verified — `tests/sorting.test.tsx > Sorting behavior > sorts by rating descending` PASSED (27ms)
- Req 7 (sort default — original order preserved): verified — `tests/app.render.test.tsx > App rendering > renders the page heading and initial product count` PASSED (57ms)
- Req 8 (no mutation — sort operates on array copy): verified — spread copy confirmed in productFilters.ts lines 21-25; all sorting tests pass without side-effects
- Req 9 (FilterPanel search onChange): verified — search-term filtering test + clear-filters test both PASSED
- Req 10 (FilterPanel category select onChange + options): verified — category filtering test + clear-filters test both PASSED
- Req 11 (FilterPanel in-stock checkbox onChange): verified — in-stock filtering test + clear-filters test both PASSED
- Req 12 (FilterPanel Clear filters button): verified — `tests/clearFilters.test.tsx > Clear filters > resets filters back to default values` PASSED (122ms)
- Req 13 (SortSelect onChange + four options present): verified — all three sorting tests used userEvent.selectOptions on sort select and PASSED
- Req 14 (empty result renders 'No products found.'): verified — ProductList.tsx already handles this; filterProducts returns [] when all products are excluded (confirmed by passing filter tests)
- Req 15 (pnpm run build exits 0, no TS/Vite errors): verified — build completed with exit code 0; output: `✓ built in 272ms`
- Req 16 (all automated tests pass): verified — `Test Files  6 passed (6)`, `Tests  17 passed (17)`, 0 failing tests

## Files changed

- `src/benchmark-frontend/src/utils/productFilters.ts`: implemented filterProducts — sequential search/category/inStock filters then sort-by-copy (price-asc, price-desc, rating-desc, default)
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: wired onChange handlers for search input, category select, in-stock checkbox, and Clear filters button
- `src/benchmark-frontend/src/components/SortSelect.tsx`: wired onChange handler to call props.onChange with cast sortBy value

## Checks

- pnpm test: 17 passed, 0 failed (6 test files: app.render.test.tsx, filtering.test.tsx, sorting.test.tsx, clearFilters.test.tsx, loadingError.test.tsx, pagination.test.tsx)
- pnpm run build: pass (exit code 0, built in 272ms)
