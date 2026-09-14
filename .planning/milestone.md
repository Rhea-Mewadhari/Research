# Milestone

Task: task1
Target: frontend

## Requirements addressed

- Req 1 (search: case-insensitive partial match with trim): verified — tests/filtering.test.tsx "filters products by search term" PASSED. vitest: 17 passed.
- Req 2 (search input accessible via getByLabelText(/search/i)): verified — all filtering tests use getByLabelText(/search/i) and PASSED. vitest: 17 passed.
- Req 3 (category dropdown filters by exact match): verified — tests/filtering.test.tsx "filters products by category" PASSED. vitest: 17 passed.
- Req 4 (category dropdown accessible via getByLabelText(/category/i); "All" shows all products): verified — filtering.test.tsx and clearFilters.test.tsx PASSED. vitest: 17 passed.
- Req 5 (in-stock checkbox filters to inStock===true products): verified — tests/filtering.test.tsx "filters products by in-stock only" PASSED. vitest: 17 passed.
- Req 6 (in-stock checkbox accessible via getByLabelText(/in-stock only/i)): verified — filtering.test.tsx and clearFilters.test.tsx PASSED. vitest: 17 passed.
- Req 7 (price-asc sort: full ascending order across 15 products): verified — tests/sorting.test.tsx "sorts by price ascending" PASSED. vitest: 17 passed.
- Req 8 (price-desc sort: Noise-Cancelling Headphones first, Jump Rope last): verified — tests/sorting.test.tsx "sorts by price descending" PASSED. vitest: 17 passed.
- Req 9 (rating-desc sort: Yoga Mat first, Mechanical Keyboard second): verified — tests/sorting.test.tsx "sorts by rating descending" PASSED. vitest: 17 passed.
- Req 10 (sort dropdown accessible via getByLabelText(/sort by/i); values: default/price-asc/price-desc/rating-desc): verified — all 3 sorting tests PASSED. vitest: 17 passed.
- Req 11 (default sort preserves original API order): verified — tests/app.render.test.tsx and clearFilters.test.tsx PASSED. vitest: 17 passed.
- Req 12 (Clear filters resets all controls; results count shows "Showing 15 products"): verified — tests/clearFilters.test.tsx "resets filters back to default values" PASSED. vitest: 17 passed.
- Req 13 (filters compose before sort): verified — clearFilters.test.tsx applies combined filters then clears to 15 products. PASSED.
- Req 14 (no mutation of input array): verified — productFilters.ts uses `let result = [...products]` and `[...result].sort(...)` throughout. All sorting tests PASSED.
- Req 15 (empty state shows "No products found."): verified — ProductList.tsx renders `<p role="status">No products found.</p>` when products.length===0. Filter logic returns [] for no-match searches.
- Req 16 (initial load: "Product Catalog" heading + "Showing 15 products"): verified — tests/app.render.test.tsx "renders the page heading and initial product count" PASSED. vitest: 17 passed.
- Req 17 (results-count includes "page N of M"): verified — tests/pagination.test.tsx "results-count includes page info" PASSED. vitest: 5 pagination tests passed.
- Req 18 (TypeScript build passes without errors): verified — pnpm build: tsc -b && vite build, 38 modules transformed, exit code 0.
- Req 19 (no new dependencies): verified — git diff HEAD -- src/benchmark-frontend/package.json produced no output.

## Files changed

- `src/benchmark-frontend/src/utils/productFilters.ts`: implemented filterProducts() — search (case-insensitive partial match with trim), category (exact match, skip when "All"), inStockOnly, and sort (price-asc/price-desc/rating-desc/default) on a spread copy to avoid mutation
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: renamed _onChange → onChange; wired search input, category select, and inStockOnly checkbox onChange handlers; wired Clear button to reset all filter state
- `src/benchmark-frontend/src/components/SortSelect.tsx`: renamed _onChange → onChange; wired select onChange to propagate sortBy changes
- `src/benchmark-frontend/src/App.tsx`: updated results-count element to include "page N of M" text alongside "Showing X products"

## Checks

- pnpm test: 17 passed, 0 failed
- pnpm run build: pass (tsc -b && vite build, 38 modules transformed, exit code 0)
