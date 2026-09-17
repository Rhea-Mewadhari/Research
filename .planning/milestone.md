# Milestone

Task: task6
Target: frontend

## Requirements addressed

- Req 1 — filterProducts filters by search (case-insensitive, trimmed): verified — filtering.test.tsx passed (3 tests); typing "mouse" produces exactly 1 result.
- Req 2 — filterProducts filters by category (exact match / "All" = no filter): verified — filtering.test.tsx (selecting "Fitness" shows 5 products); clearFilters.test.tsx (category resets to "All" showing 15 products).
- Req 3 — filterProducts filters by inStockOnly: verified — filtering.test.tsx passed; checking in-stock reduces results to exactly 11 products.
- Req 4 — filterProducts sorts price ascending: verified — sorting.test.tsx passed; Jump Rope first, Noise-Cancelling Headphones last.
- Req 5 — filterProducts sorts price descending: verified — sorting.test.tsx passed; Noise-Cancelling Headphones first, Jump Rope last.
- Req 6 — filterProducts sorts rating descending: verified — sorting.test.tsx passed; Yoga Mat first, Mechanical Keyboard second.
- Req 7 — sort applied after all filters: verified — sorting.test.tsx (3 tests) all passed with correct counts; filter-then-sort order confirmed.
- Req 8 — filterProducts does not mutate input array: verified — multiple independent sort tests in sorting.test.tsx all produced correct independent orderings.
- Req 9 — preserves original order for sortBy "default": verified — app.render.test.tsx passed (1 test); initial render shows 15 products in original order.
- Req 10 — FilterPanel search onChange wired: verified — filtering.test.tsx (typing "mouse" → 1 result); clearFilters.test.tsx (typing then clearing resets to "").
- Req 11 — FilterPanel category onChange wired: verified — filtering.test.tsx ("Fitness" → 5 products); clearFilters.test.tsx (reset to "All").
- Req 12 — FilterPanel inStockOnly onChange wired: verified — filtering.test.tsx (checkbox → 11 results); clearFilters.test.tsx (reset to unchecked).
- Req 13 — FilterPanel Clear Filters resets all fields: verified — clearFilters.test.tsx passed; all fields reset to { search: '', category: 'All', inStockOnly: false, sortBy: 'default' }, showing 15 products.
- Req 14 — SortSelect onChange wired: verified — sorting.test.tsx ("price-asc" produces reordered list, "rating-desc" puts Yoga Mat first); clearFilters.test.tsx (resets to "default").
- Req 15 — App.tsx wraps filter updates to reset page to 1: verified — source inspection confirms both FilterPanel onChange and SortSelect onChange call setPage(1); pagination.test.tsx passed (5 tests).
- Req 16 — Protected files unchanged: verified — git diff shows no changes to src/api/productsApi.ts or src/hooks/useProductFilters.ts.
- Req 17 — TypeScript build succeeds: verified — pnpm build exited 0; "✓ built in 280ms", 38 modules transformed, no type errors.
- Req 18 — All visible tests pass: verified — pnpm test: 6 test files passed, 17 tests passed, 0 failed.

## Files changed

- `src/benchmark-frontend/src/utils/productFilters.ts`: Implemented filterProducts — search (case-insensitive, trimmed), category (exact match / "All"), inStockOnly, and sort (price-asc, price-desc, rating-desc, default); sorts after filtering; spreads input array before sort to avoid mutation.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Renamed _onChange prop to onChange; wired search input, category select, inStockOnly checkbox, and Clear Filters button onChange handlers.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Renamed _onChange prop to onChange; wired sort select onChange to call onChange with value cast to FilterState['sortBy'].
- `src/benchmark-frontend/src/App.tsx`: Replaced direct setFilters pass-through with wrapper lambdas that call both setFilters and setPage(1) for both FilterPanel and SortSelect.

## Checks

- pnpm test: 17 passed, 0 failed (6 test files: app.render, loadingError, pagination, clearFilters, filtering, sorting)
- pnpm run build: pass (tsc -b && vite build, exit 0, ✓ built in 280ms)
