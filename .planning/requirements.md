# Requirements

## Bugs to fix

1. **App.tsx — invalid JSX self-closing element**
   `<ProductList products={visibleProducts}` on line 47 is missing its closing `/>`, producing a fatal
   JSX parse error that prevents compilation.
   - Verified by: `pnpm run build` exits 0 (TypeScript currently reports `TS1003: Identifier expected`
     at `src/App.tsx(48,11)` — this error must be absent after the fix).

2. **App.tsx — missing CSS import path**
   `import './styles.css'` (line 2) references a file that does not exist. `src/styles/` is a
   directory; the actual CSS file is `src/styles/style.css`.  
   The correct import is `import './styles/style.css'`.
   - Verified by: `pnpm run build` exits 0 and produces no "Failed to resolve import" or
     "Cannot find module" Vite error related to `styles.css`.

3. **ProductCard.tsx — wrong property name (`discountPercent` vs `discountPct`)**
   The component reads `product.discountPercent` in three places (lines 9, 25, 37). The `Product`
   type in `src/types/product.ts` defines the optional field as `discountPct`. The data fixture
   (`src/data/products.ts`) also uses `discountPct`. Accessing `discountPercent` is a TypeScript
   type error ("Property 'discountPercent' does not exist on type 'Product'").  
   All three occurrences must be changed to `product.discountPct`.
   - Verified by: `pnpm exec tsc -b --noEmit` exits 0 with no type errors relating to
     `discountPercent`; `pnpm test` passes (discount badge and discounted prices rendered correctly
     for products that carry a `discountPct` value, e.g. Webcam HD, Resistance Bands, Cable Organiser).

4. **SortSelect.tsx — `string` passed where sort-key union is required**
   The change handler `onChange={(e) => onChange(e.target.value)}` passes `string` (the type of
   `HTMLSelectElement.value`) to a callback typed as `(sortBy: FilterState['sortBy']) => void`,
   where `FilterState['sortBy']` is `'default' | 'price-asc' | 'price-desc' | 'rating-desc'`.
   This is a TypeScript type mismatch.  
   Fix by casting: `onChange(e.target.value as FilterState['sortBy'])`.
   - Verified by: `pnpm exec tsc -b --noEmit` exits 0 with no type error at `SortSelect.tsx`;
     `pnpm test` sorting suite (`tests/sorting.test.tsx`) passes for all three sort directions.

---

## Build & test gate (overall success criteria)

5. **Build succeeds without errors**
   - Verified by: `pnpm run build` exits 0 and emits no TypeScript or Vite errors to stderr.

6. **All tests pass**
   - Verified by: `pnpm test` exits 0 with all test suites reporting 0 failures across
     `app.render.test.tsx`, `clearFilters.test.tsx`, `filtering.test.tsx`, `loadingError.test.tsx`,
     `pagination.test.tsx`, and `sorting.test.tsx`.

---

## Edge cases

- Discount badge display (`hasDiscount`) depends on `discountPct != null`; after fixing requirement 3
  the badge and original-price strikethrough must appear only on products with `discountPct` set
  (Webcam HD, Resistance Bands, Cable Organiser) and must not appear on products without it
  — covered by requirement 3.
- Sort-key cast in requirement 4 must not break the default/reset-filter path; after "Clear filters"
  the sort select value is `'default'`, which is a valid member of the union — covered by
  requirements 4 and 6.
- No test files may be modified (constraint from framework.md) — requirements 5 and 6 are satisfied
  by fixing source files only.
