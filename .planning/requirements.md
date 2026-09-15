# Requirements

1. `src/benchmark-frontend/src/App.tsx` imports the CSS stylesheet from `./styles/style.css`, not `./styles.css`.
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 with no module-resolution error for the CSS path; `grep -n "styles.css" src/benchmark-frontend/src/App.tsx` returns no matches.

2. The `<ProductList>` element in `src/benchmark-frontend/src/App.tsx` is self-closed (`/>`) before the pagination `<div>`, forming valid JSX.
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 with no JSX parse error; `pnpm --filter benchmark-frontend test` passes all cases in `tests/app.render.test.tsx` and `tests/pagination.test.tsx`.

3. `src/benchmark-frontend/src/components/ProductCard.tsx` references `product.discountPct` (matching the `Product` type in `src/types/product.ts`) in every occurrence — no reference to `product.discountPercent` remains.
   - Verified by: `pnpm --filter benchmark-frontend build` exits 0 with no TypeScript error on `Product`; `grep -n "discountPercent" src/benchmark-frontend/src/components/ProductCard.tsx` returns no matches; all three original usage sites (lines 9, 25, 37 in the unpatched file) use `discountPct`.

4. `src/benchmark-frontend/src/components/SortSelect.tsx` casts `e.target.value` to `FilterState['sortBy']` before passing it to `onChange`, eliminating the `string` vs `'default' | 'price-asc' | 'price-desc' | 'rating-desc'` type mismatch.
   - Verified by: `pnpm --filter benchmark-frontend build` exits 0 with no TypeScript error in `SortSelect.tsx`; `pnpm --filter benchmark-frontend test` passes all cases in `tests/sorting.test.tsx`.

5. The full Vitest test suite passes with no failures.
   - Verified by: `pnpm --filter benchmark-frontend test` exits with code 0 and reports 0 failed tests across all suites (`app.render.test.tsx`, `filtering.test.tsx`, `sorting.test.tsx`, `pagination.test.tsx`, `clearFilters.test.tsx`, `loadingError.test.tsx`).

## Edge cases

- `discountPct` is optional (`discountPct?: number`) — the `hasDiscount` guard in `ProductCard.tsx` must use `discountPct`, not `discountPercent`, so products without a discount still render correctly (no `undefined` badge or price strike-through): covered by requirement 3.
- The `<ProductList />` self-close must pass `products={visibleProducts}` as a prop before the `/>` — omitting the prop would break the product grid even with the tag fixed: covered by requirement 2.
- The type cast in `SortSelect.tsx` must be `as FilterState['sortBy']`, not `as any`, to remain consistent with the project's no-`any` TypeScript standard: covered by requirement 4.
- No existing test files may be modified — all fixes must be confined to source files under `src/`: covered by requirements 1–4 (all touch only `src/` files).
