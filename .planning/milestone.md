# Milestone

Task: task7
Target: frontend

## Requirements addressed

- Req 1 — SortSelect reads value from FilterContext.sortBy and calls FilterContext.setSortBy: verified — ProductListPage.tsx line 76: `<SortSelect value={sortBy} onChange={setSortBy} />`, both destructured from useFilterContext().
- Req 2 — local sort state (localSortBy/setLocalSortBy) removed from ProductListPage: verified — grep for 'localSortBy' in ProductListPage.tsx returned no output.
- Req 3 — price-asc sort puts Jump Rope first: verified — tests/sorting.test.tsx 'sorts by price ascending' and tests/contextMigration.test.tsx 'selecting a sort option re-orders the product list' both passed.
- Req 4 — price-desc sort puts Noise-Cancelling Headphones first, Jump Rope last: verified — tests/sorting.test.tsx 'sorts by price descending' and contextMigration.test.tsx 'selecting price-desc puts the most expensive product first' both passed.
- Req 5 — rating-desc sort puts Yoga Mat first: verified — tests/sorting.test.tsx 'sorts by rating descending' passed.
- Req 6 — clicking "Filter by [category]" updates FilterContext.category and re-filters list: verified — tests/contextMigration.test.tsx 'clicking a product category button filters the list to that category' passed (4/4).
- Req 7 — after category click only that category's products remain visible: verified — tests/contextMigration.test.tsx 'clicking a category button hides products from other categories' passed.
- Req 8 — ProductCard calls useFilterContext().setCategory(product.category) directly, not via prop: verified — ProductCard.tsx line 4 imports useFilterContext; line 14 destructures setCategory; lines 47–50 call setCategory(product.category). No 'onCategoryClick' in file.
- Req 9 — onCategoryClick removed from both ProductCard.Props and ProductList.Props: verified — grep for 'onCategoryClick' in both files returned no output.
- Req 10 — no-op onCategoryClick removed from <ProductList> in ProductListPage: verified — grep for 'onCategoryClick' in ProductListPage.tsx returned no output.
- Req 11 — "Filter by [category]" button remains rendered with correct aria-label: verified — contextMigration.test.tsx locates button via getByRole('button', { name: /filter by electronics/i }); all 4 tests pass.
- Req 12 — category button onClick includes e.stopPropagation(): verified — ProductCard.tsx line 48 contains e.stopPropagation().
- Req 13 — ProductList continues to accept and forward onSelect: verified — ProductList.tsx line 6: onSelect in Props; line 21: onSelect={onSelect} passed to each <ProductCard>.
- Req 14 — no new useState for sortBy or category introduced in any of the three files: verified — only useState in any of the three files is ProductListPage.tsx line 28 for detailProductId (unrelated).
- Req 15 — all tests pass and build succeeds: verified — 7 test files, 21 tests, all passed; pnpm run build: 65 modules transformed, exit code 0.

## Files changed

- src/benchmark-frontend/src/components/ProductCard.tsx: Added useFilterContext import; removed onCategoryClick from Props; category button onClick now calls setCategory(product.category) directly.
- src/benchmark-frontend/src/components/ProductList.tsx: Removed onCategoryClick from Props type, parameter destructure, and <ProductCard> JSX.
- src/benchmark-frontend/src/pages/ProductListPage.tsx: Added setSortBy to useFilterContext() destructure; removed localSortBy/setLocalSortBy useState; wired <SortSelect> to context sortBy/setSortBy; removed onCategoryClick no-op from <ProductList>; removed unused SortOption import.

## Checks

- pnpm test: 21 passed, 0 failed (7 test files)
- pnpm run build: pass (65 modules transformed, exit code 0)
