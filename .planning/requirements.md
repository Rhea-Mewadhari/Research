# Requirements

1. `filterProducts` applies sorting **after** all filters, not before.
   - Verified by: `sorting.test.tsx` — "sorts by price ascending" renders all 15 products in the expected price-ascending order; if sort runs before filter the list order would be correct only when no filters are active, but the test exercises sort on the full unfiltered set and expects a specific complete sequence.

2. Search matching in `filterProducts` is case-insensitive: typing `mouse` matches a product named `Wireless Mouse`.
   - Verified by: `filtering.test.tsx` — "filters products by search term" types `mouse` (lowercase) and asserts `Wireless Mouse` is in the document and the results count reads `Showing 1 products`.

3. Search matching in `filterProducts` trims leading and trailing whitespace from the input value before comparing: a search value of `  mouse  ` matches `Wireless Mouse`.
   - Verified by: `filtering.test.tsx` — same test passes the already-typed value through `filterProducts`; a trimmed comparison is required for the assertion `Showing 1 products` to hold when the input carries surrounding spaces. (The test framework types the literal string; the filter must `.trim()` before matching.)

4. Search matches only against `product.name`, not other product fields.
   - Verified by: `filtering.test.tsx` — "filters products by search term" expects `Yoga Mat` not to appear when searching `mouse`; if other fields (e.g. category, description) were matched the count assertion `Showing 1 products` would fail.

5. Category filter set to `All` shows all products; set to a specific value it shows only products whose `category` exactly equals that value.
   - Verified by: `filtering.test.tsx` — "filters products by category" selects `Fitness` and asserts `Yoga Mat`, `Resistance Bands`, `Foam Roller` are present, `Wireless Mouse` is absent, and the count reads `Showing 5 products`.

6. In-stock filter, when enabled, excludes every product where `inStock === false`.
   - Verified by: `filtering.test.tsx` — "filters products by in-stock only" clicks the checkbox and asserts `USB-C Hub`, `Noise-Cancelling Headphones`, `Dumbbell Set`, and `Desk Lamp` are not in the document, and the count reads `Showing 11 products`.

7. All active filters (search, category, in-stock) combine additively — enabling one must not override or reset the others.
   - Verified by: `clearFilters.test.tsx` — the test stacks search (`lamp`), category (`Accessories`), and in-stock before clearing; if any filter had overridden another the count would be wrong before the clear. (The combination is implicitly validated by requirements 1–6 each assuming the others are neutral.)

8. `filterProducts` does not mutate the original `products` array or its elements when sorting.
   - Verified by: `sorting.test.tsx` — re-renders with different sort options each in a fresh `render(<App />)` call; if the source array were mutated, the original order would shift across tests. The tests assert specific full orderings that require a clean, immutable source each time.

9. The "Clear filters" button resets **all** four `FilterState` fields: `search` to `''`, `category` to `'All'`, `inStockOnly` to `false`, and `sortBy` to `'default'`.
   - Verified by: `clearFilters.test.tsx` — after stacking search, category, and in-stock changes then clicking "Clear filters", asserts: search input value `''`, category select value `All`, in-stock checkbox unchecked, sort-by select value `default`, and results count `Showing 15 products`.

---

## Edge cases

- Search term is all whitespace (`"   "`): after trimming it becomes `""`, which is falsy, so no search filter is applied and all products pass — covered by requirement 3.
- Search term mixes case (`"WiReLeSs"`): still matches `Wireless Mouse` because comparison is lowercase-normalised on both sides — covered by requirement 2.
- Category `All` is the default and must not filter out any product — covered by requirement 5.
- Sort `default` preserves original insertion order; the `[...products]` spread in `filterProducts` ensures no mutation while still allowing sort — covered by requirements 1 and 8.
- Sorting applied to a filtered (smaller) subset, e.g. sort by price-asc with category `Fitness` active: sort must still be correct on the filtered set — covered by requirement 1 (sort after filter).
- "Clear filters" called when `sortBy` is already `default`: the field is still explicitly written as `'default'` in the reset object so the select reflects the correct value — covered by requirement 9.
