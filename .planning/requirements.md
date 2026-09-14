# Requirements

1. Typing into the search input filters displayed products to those whose `name` contains the search term as a case-insensitive partial match after trimming leading/trailing whitespace. Typing `mouse` must show "Wireless Mouse" and hide "Yoga Mat"; the results count must read "Showing 1 products".
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term"

2. The search input must be labelled such that `getByLabelText(/search/i)` finds it (i.e. an `<input>` associated via `htmlFor`/`id` or `aria-label` matching `/search/i`).
   - Verified by: `tests/filtering.test.tsx` — all three tests use `getByLabelText(/search/i)`

3. Selecting a specific category from the category dropdown filters displayed products to those whose `category` field exactly matches the selected value. Selecting "Fitness" must show "Yoga Mat", "Resistance Bands", and "Foam Roller", hide "Wireless Mouse", and the results count must read "Showing 5 products".
   - Verified by: `tests/filtering.test.tsx` — "filters products by category"

4. The category dropdown must be labelled such that `getByLabelText(/category/i)` finds it, and selecting "All" must show all products regardless of category.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category"; `tests/clearFilters.test.tsx` — clear resets to value "All"

5. Checking the in-stock checkbox filters displayed products to those with `inStock === true`. After checking, "USB-C Hub", "Noise-Cancelling Headphones", "Dumbbell Set", and "Desk Lamp" must not appear, and the results count must read "Showing 11 products".
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only"

6. The in-stock checkbox must be labelled such that `getByLabelText(/in-stock only/i)` finds it.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only"; `tests/clearFilters.test.tsx`

7. Selecting `price-asc` from the sort dropdown renders products ordered by ascending `price`. The full order across all 15 products must match exactly: Jump Rope, Cable Organiser, Foam Roller, Wireless Mouse, Ergonomic Wrist Rest, Resistance Bands, Monitor Riser, Yoga Mat, Desk Lamp, Laptop Stand, USB-C Hub, Webcam HD, Dumbbell Set, Mechanical Keyboard, Noise-Cancelling Headphones.
   - Verified by: `tests/sorting.test.tsx` — "sorts by price ascending"

8. Selecting `price-desc` from the sort dropdown renders products ordered by descending `price`. The first product must be "Noise-Cancelling Headphones", the second "Mechanical Keyboard", and the last "Jump Rope".
   - Verified by: `tests/sorting.test.tsx` — "sorts by price descending"

9. Selecting `rating-desc` from the sort dropdown renders products ordered by descending `rating`. The first product must be "Yoga Mat" and the second must be "Mechanical Keyboard".
   - Verified by: `tests/sorting.test.tsx` — "sorts by rating descending"

10. The sort dropdown must be labelled such that `getByLabelText(/sort by/i)` finds it, and must accept option values `default`, `price-asc`, `price-desc`, and `rating-desc`.
    - Verified by: `tests/sorting.test.tsx` — all three sorting tests use `getByLabelText(/sort by/i)` and `selectOptions` with those values

11. Selecting `default` (or on initial load) preserves the original product order as received from the API; no re-ordering is applied.
    - Verified by: `tests/app.render.test.tsx` — initial render shows 15 products in default order; `tests/clearFilters.test.tsx` — after clear, sort select has value "default" and 15 products are shown

12. Clicking the "Clear filters" button resets all filter state: the search input becomes empty string, the category dropdown becomes "All", the in-stock checkbox becomes unchecked, and the sort dropdown becomes "default". The results count must read "Showing 15 products" after reset.
    - Verified by: `tests/clearFilters.test.tsx` — "resets filters back to default values" (asserts each control's value and results count)

13. All active filters (search, category, inStockOnly) are applied together before sorting — i.e. filtering is composed and sorting is applied to the already-filtered result set, not the raw product list.
    - Verified by: `tests/clearFilters.test.tsx` — applying search + category + inStockOnly together then clearing to 15 products proves composition; any combined-filter scenario must not exceed the individually-filtered counts

14. The `filterAndSortProducts` function (or equivalent) in `src/utils/productFilters.ts` must not mutate its input array. Sorting must be performed on a copy (e.g. `[...products].sort(...)`), not by calling `.sort()` directly on the argument.
    - Verified by: `tests/sorting.test.tsx` — if mutation occurred, the default order would differ on re-renders; additionally this is a direct spec constraint from TASK1.MD and framework.md

15. When the active filters produce zero matching products, the UI must render the text "No products found." and no product cards.
    - Verified by: entering a search term that matches no product (e.g. `"zzzzz"`) must show the text "No products found." in the DOM — confirmed by TASK1.MD functional requirement §6

16. On initial load, the page heading "Product Catalog" is present and the results count reads "Showing 15 products".
    - Verified by: `tests/app.render.test.tsx` — "renders the page heading and initial product count"

17. The results count element (`data-testid="results-count"`) must include page info in the format "page N of M".
    - Verified by: `tests/pagination.test.tsx` — "results-count includes page info" asserts text content contains "page 1 of 1"

18. The TypeScript build (`pnpm build` in `src/benchmark-frontend`) must complete without errors after all changes.
    - Verified by: running `pnpm build` and confirming exit code 0 with no TypeScript errors

19. No new npm/pnpm dependencies are added; `package.json` remains unchanged.
    - Verified by: `git diff src/benchmark-frontend/package.json` shows no changes

---

## Edge cases

- Leading/trailing whitespace in search: `  lamp ` must match "Desk Lamp" — covered by requirement 1
- Search is case-insensitive: `MOUSE` must match "Wireless Mouse" — covered by requirement 1
- Partial name match: `board` must match "Mechanical Keyboard" — covered by requirement 1
- Category "All" shows every product regardless of `category` field — covered by requirement 4
- Clear filters after combined filters applied: all controls return to defaults simultaneously — covered by requirement 12
- Default sort after clear: products appear in original API order, not price/rating order — covered by requirement 11
- In-stock filter with zero in-stock products in a filtered set: produces empty state — covered by requirement 15
- Sorting does not change which products pass the filter; it only reorders the already-filtered list — covered by requirement 13
