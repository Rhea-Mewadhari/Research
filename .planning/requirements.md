# Requirements

1. `src/benchmark-frontend/src/App.tsx` must close the `<ProductList>` element as a self-closing tag (`<ProductList products={visibleProducts} />`), making `<div className="pagination">` its sibling rather than part of an unclosed element.
   - Verified by: `pnpm --filter benchmark-frontend exec tsc --noEmit` exits 0 (no JSX parse or structural error on App.tsx); `pnpm --filter benchmark-frontend test` suite `app.render.test.tsx` passes (page renders the heading and `results-count` testid).

2. `src/benchmark-frontend/src/components/ProductCard.tsx` must reference `product.discountPct` (matching the `discountPct?: number` field declared in `src/benchmark-frontend/src/types/product.ts`) everywhere it currently references `product.discountPercent` (lines 9, 25, and 37).
   - Verified by: `pnpm --filter benchmark-frontend exec tsc --noEmit` exits 0 with no "Property 'discountPercent' does not exist on type 'Product'" diagnostic.

3. `src/benchmark-frontend/src/components/SortSelect.tsx` must cast `e.target.value` to `FilterState['sortBy']` before passing it to the `onChange` prop, so that `string` (the DOM event value type) does not violate the narrower union prop type `'default' | 'price-asc' | 'price-desc' | 'rating-desc'`.
   - Verified by: `pnpm --filter benchmark-frontend exec tsc --noEmit` exits 0 with no "Argument of type 'string' is not assignable to parameter of type" diagnostic on SortSelect.tsx.

4. The full test suite passes without any modification to files under `tests/`.
   - Verified by: `pnpm --filter benchmark-frontend test` exits 0 with all test files (`app.render.test.tsx`, `clearFilters.test.tsx`, `filtering.test.tsx`, `loadingError.test.tsx`, `pagination.test.tsx`, `sorting.test.tsx`) reporting no failures.

5. The application builds successfully (Vite production build) with no compilation errors.
   - Verified by: `pnpm --filter benchmark-frontend build` exits 0 and emits output files to `dist/`.

## Edge cases

- `discountPct` is optional (`discountPct?: number`) — requirement 2 must not break the `hasDiscount` null-check logic; renaming `discountPercent` → `discountPct` is the fix, not altering the conditional semantics: covered by requirement 2.
- The `sortBy` cast in SortSelect must not introduce an `any` type — `as FilterState['sortBy']` preserves the union literal type: covered by requirement 3.
- No test files may be modified — all fixes are limited to source files under `src/`: covered by requirements 1–3 (all target `src/` files only).
