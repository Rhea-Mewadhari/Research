# Requirements

1. Search filter is case-insensitive: typing a lowercase term (e.g. `mouse`) must return
   products whose `name` matches regardless of case (e.g. `Wireless Mouse`).
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" types `'mouse'`
     and asserts `Wireless Mouse` is visible and the results count reads `Showing 1 products`.

2. Search filter trims leading/trailing whitespace: a query such as `'  mouse  '` must
   produce the same results as `'mouse'` — i.e. `filters.search.trim()` is used before
   matching.
   - Verified by: implementation check in `src/utils/productFilters.ts` — the match
     expression uses `filters.search.trim().toLowerCase()` against
     `product.name.toLowerCase()`; TASK2.MD requires it.

3. Search filter matches only `product.name`, not any other field (category, description, etc.).
   - Verified by: `tests/filtering.test.tsx` — searching `'mouse'` shows exactly 1 product
     (`Wireless Mouse`) and hides unrelated products such as `Yoga Mat`.

4. All active filters combine with AND semantics: a product must satisfy every active filter
   (search, category, inStockOnly) simultaneously; enabling one filter must not reset or
   override another.
   - Verified by: `tests/filtering.test.tsx` — each individual filter narrows the result set
     independently; the implementation applies each step sequentially to the same `result`
     array.

5. Category value `'All'` disables category filtering and shows all products (subject to
   other active filters).
   - Verified by: `tests/filtering.test.tsx` — on initial render (category = `'All'`) all 15
     products appear; switching to `'Fitness'` reduces the count to 5.

6. Selecting a specific category strictly matches `product.category` and excludes products
   in any other category.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category" selects
     `'Fitness'`, asserts Yoga Mat / Resistance Bands / Foam Roller are visible, asserts
     Wireless Mouse is not visible, and the count reads `Showing 5 products`.

7. In-stock filter excludes every product where `inStock === false` when `inStockOnly` is
   `true`.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only" clicks the
     checkbox and asserts USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, and Desk Lamp
     are absent, and the count reads `Showing 11 products`.

8. Sorting is applied **after** all filter steps, so it operates only on the filtered result
   set. The sort block must appear below all `result = result.filter(...)` calls in
   `productFilters.ts`.
   - Verified by: code position in `src/utils/productFilters.ts` — sort block is the last
     step before `return result`.

9. Sorting does not mutate the source array: `filterProducts` must copy the input with
   `[...products]` before sorting. Calling `.sort()` directly on the `products` argument is
   a defect.
   - Verified by: `let result = [...products]` is present and all `.sort()` calls act on
     `result`; `tests/sorting.test.tsx` renders a fresh component for each test and would
     fail on a second render if the source array were mutated.

10. `sortBy: 'price-asc'` orders the (filtered) result from lowest price to highest.
    - Verified by: `tests/sorting.test.tsx` — "sorts by price ascending" asserts the exact
      product-name sequence across all 15 products:
      Jump Rope, Cable Organiser, Foam Roller, Wireless Mouse, Ergonomic Wrist Rest,
      Resistance Bands, Monitor Riser, Yoga Mat, Desk Lamp, Laptop Stand, USB-C Hub,
      Webcam HD, Dumbbell Set, Mechanical Keyboard, Noise-Cancelling Headphones.

11. `sortBy: 'price-desc'` orders the (filtered) result from highest price to lowest.
    - Verified by: `tests/sorting.test.tsx` — "sorts by price descending" asserts
      `names[0] === 'Noise-Cancelling Headphones'`, `names[1] === 'Mechanical Keyboard'`,
      and `names[names.length - 1] === 'Jump Rope'`.

12. `sortBy: 'rating-desc'` orders the (filtered) result from highest rating to lowest.
    - Verified by: `tests/sorting.test.tsx` — "sorts by rating descending" asserts
      `names[0] === 'Yoga Mat'` and `names[1] === 'Mechanical Keyboard'`.

13. `sortBy: 'default'` preserves the original (API-returned) product order — no sort
    comparison is applied.
    - Verified by: initial render in all test files shows products in their source order
      without any sorting active.

14. The "Clear filters" button in `FilterPanel.tsx` resets **all** four filter fields:
    `search → ''`, `category → 'All'`, `inStockOnly → false`, `sortBy → 'default'`.
    - Verified by: `tests/clearFilters.test.tsx` — "resets filters back to default values"
      sets search, category, inStockOnly, and sort to non-default values, clicks
      "Clear filters", then asserts:
      - search input value is `''`
      - category select value is `'All'`
      - in-stock checkbox is unchecked
      - sort select value is `'default'`
      - results count reads `Showing 15 products`.

---

## Edge cases

- Search term consisting entirely of whitespace (e.g. `'   '`): after `.trim()` becomes
  `''`; the search filter is not applied and all products (before other filters) are shown.
  Covered by requirement 2.

- Clear filters called while a sort is active: the sort field must reset to `'default'`
  along with the other fields. Covered by requirement 14.

- Category filter combined with inStockOnly: both conditions must be satisfied simultaneously;
  selecting `'Fitness'` and enabling in-stock does not override the category filter.
  Covered by requirements 4, 6, and 7.

- Sort with no other filters active: sort operates on the full 15-product set.
  Covered by requirements 10–12 (no filter is active in those tests).

- Sort combined with an active filter: sort must apply only to the already-filtered subset,
  not the full dataset. Covered by requirement 8.
