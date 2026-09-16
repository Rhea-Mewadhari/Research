# Requirements

1. `src/benchmark-frontend/src/App.tsx` imports `'./App.css'`, not `'./styles.css'`.
   - Verified by: `cd src/benchmark-frontend && npm run build` exits 0 with no "Failed to resolve import" or "Cannot find module" error referencing `styles.css`.

2. The `<ProductList>` JSX element in `src/benchmark-frontend/src/App.tsx` is self-closing — i.e., it ends with `/>` and is not a structurally broken open tag.
   - Verified by: `cd src/benchmark-frontend && npx tsc --noEmit` exits 0 (TypeScript parses and type-checks the file without JSX parse errors).

3. All references to `product.discountPercent` in `src/benchmark-frontend/src/components/ProductCard.tsx` are replaced with `product.discountPct`, matching the field name declared in `src/benchmark-frontend/src/types/product.ts` (`discountPct?: number`). No occurrence of the string `discountPercent` remains in that file.
   - Verified by: `grep -n "discountPercent" src/benchmark-frontend/src/components/ProductCard.tsx` returns no output; `cd src/benchmark-frontend && npx tsc --noEmit` exits 0.

4. The `onChange` handler in `src/benchmark-frontend/src/components/SortSelect.tsx` passes `e.target.value` cast to `FilterState['sortBy']` (i.e., `e.target.value as FilterState['sortBy']`), eliminating the type mismatch between `string` and the `'default' | 'price-asc' | 'price-desc' | 'rating-desc'` union.
   - Verified by: `cd src/benchmark-frontend && npx tsc --noEmit` exits 0 with no type error on the `onChange` call in `SortSelect.tsx`.

5. All six Vitest tests across `tests/app.render.test.tsx`, `tests/clearFilters.test.tsx`, `tests/filtering.test.tsx`, `tests/loadingError.test.tsx`, `tests/sorting.test.tsx`, and `tests/pagination.test.tsx` pass.
   - Verified by: `cd src/benchmark-frontend && npm test` exits 0 and reports 0 failing tests.

6. The full production build succeeds: TypeScript compilation and Vite bundling complete without errors.
   - Verified by: `cd src/benchmark-frontend && npm run build` exits 0 with no errors in stdout/stderr.

7. No existing functionality is changed — no logic, component structure, or behaviour is altered beyond the four targeted bug fixes above.
   - Verified by: `git diff src/benchmark-frontend/src/` shows changes only in `App.tsx` (import line and `<ProductList>` closing), `ProductCard.tsx` (three `discountPercent` → `discountPct` renames), and `SortSelect.tsx` (the `as FilterState['sortBy']` cast). No other files are modified.

## Edge cases

- `discountPct` is optional (`discountPct?: number`): the `hasDiscount` guard (`product.discountPct != null`) must use the correct field name so that products without a discount correctly render without a badge or original-price element — covered by requirement 3.
- The `SortSelect` cast must not widen the type (e.g., `as any`); it must use `as FilterState['sortBy']` so TypeScript still narrows on invalid values — covered by requirement 4.
- Only `App.css` exists in `src/`; `styles.css` does not. The import fix must reference the existing file exactly — covered by requirement 1.
- The `<ProductList>` fix must only add the missing `/>` closer and must not alter the `products` prop or introduce new props — covered by requirement 2 and 7.
