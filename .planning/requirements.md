# Requirements

1. `App.tsx` imports the stylesheet from the correct path `'./styles/style.css'` (not `'./styles.css'`).
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 (build fails with the wrong path because `src/styles.css` does not exist).

2. `App.tsx` closes the `<ProductList>` JSX element with `/>` before the sibling `<div className="pagination">` (line 47 currently reads `<ProductList products={visibleProducts}` with no closing `/>`, which is invalid JSX).
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 (the unclosed tag causes a parse error that blocks the build).

3. `ProductCard.tsx` references `product.discountPct` (not `product.discountPercent`) in all three places where the discount field is used: the `hasDiscount` assignment, the badge text interpolation, and the `formatPrice` call.
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 (TypeScript rejects `product.discountPercent` because it is not a member of the `Product` type); additionally `pnpm --filter benchmark-frontend test` passes the `app.render.test.tsx` suite which renders `ProductCard` instances.

4. `SortSelect.tsx` casts `e.target.value` to `FilterState['sortBy']` before passing it to `onChange`, so the call matches the expected type `(sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc') => void`.
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 (TypeScript rejects the uncast `string` argument); additionally `pnpm --filter benchmark-frontend test` passes the `sorting.test.tsx` suite which exercises sort-by changes via the select element.

5. All visible tests pass after the above fixes with no test file modifications.
   - Verified by: `pnpm --filter benchmark-frontend test` exits with code 0 and reports 0 failed tests across all test files in `src/benchmark-frontend/tests/`.

6. No functionality is changed beyond the four error corrections listed above: component structure, props, render output, and utility logic remain identical to the pre-fix state.
   - Verified by: `git diff` after fixes shows changes only in `App.tsx` (lines 2 and 47), `ProductCard.tsx` (lines 9, 25, 37), and `SortSelect.tsx` (line 16) — no other files are modified.

## Edge cases

- `product.discountPct` is declared `optional` (`discountPct?: number`): the `hasDiscount` guard (`!= null`) correctly handles both `undefined` and `null`; replacing `discountPercent` with `discountPct` must not alter this guard logic — covered by requirement 3.
- `e.target.value` at runtime will always be one of the four `<option value>` strings; the cast is type-safe even though TypeScript cannot verify it statically — covered by requirement 4.
- The `<ProductList />` self-closing fix must not add or remove any props to the component — covered by requirements 2 and 6.
- The correct CSS file `src/styles/style.css` already exists; no new file needs to be created — covered by requirement 1.
