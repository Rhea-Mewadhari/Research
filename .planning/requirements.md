# Requirements

## Test file: tests/app.render.test.tsx

1. Loading spinner is present immediately after render, before fetch resolves.
   - Verified by: Render `<App />` synchronously; immediately call `getByLabelText('loading')` and assert the element is in the document; assert `queryByTestId('results-count')` returns null (not yet rendered).

2. After fetch resolves, `data-testid="results-count"` text reads exactly "Showing 15 products (page 1 of 1)".
   - Verified by: `await screen.findByTestId('results-count')`, then assert its `textContent` equals `"Showing 15 products (page 1 of 1)"`.

3. After fetch resolves, all 15 product cards are in the DOM.
   - Verified by: After `findByTestId('results-count')`, assert each `data-testid="product-{id}"` element (id 1–15) is present in the document, or assert that all 15 product names visible in the product list (e.g. "Wireless Mouse" through "Ergonomic Wrist Rest").

---

## Test file: tests/filtering.test.tsx

4. Typing a search term that matches one product narrows the count and shows only the matching product.
   - Verified by: After load, `userEvent.type` into `getByLabelText('Search')` with value `"keyboard"`; assert `getByTestId('results-count').textContent` equals `"Showing 1 products (page 1 of 1)"`; assert `getByText('Mechanical Keyboard')` is in the document; assert all other 14 product names are absent.

5. Search matching is case-insensitive.
   - Verified by: Same as requirement 4 using the input value `"KEYBOARD"` — result count and visible product are identical.

6. Selecting category "Electronics" from the category select narrows to 5 products.
   - Verified by: After load, `userEvent.selectOptions(getByLabelText('Category'), 'Electronics')`; assert `results-count` text is `"Showing 5 products (page 1 of 1)"`; assert Wireless Mouse, USB-C Hub, Mechanical Keyboard, Webcam HD, and Noise-Cancelling Headphones are each in the document.

7. Checking the "In-stock only" checkbox narrows to 11 products.
   - Verified by: After load, `userEvent.click(getByLabelText('In-stock only'))`; assert `results-count` text is `"Showing 11 products (page 1 of 1)"`; assert USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, and Desk Lamp are each absent from the document.

8. Combining category "Electronics" and in-stock filter narrows to 3 products.
   - Verified by: After load, select "Electronics" and check "In-stock only"; assert `results-count` text is `"Showing 3 products (page 1 of 1)"`; assert Wireless Mouse, Mechanical Keyboard, and Webcam HD are present; assert USB-C Hub and Noise-Cancelling Headphones are absent.

9. A search term matching no products produces a zero count and a "No products found." status message.
   - Verified by: After load, type `"zzznomatch"` in the search input; assert `results-count` text is `"Showing 0 products (page 1 of 1)"`; assert `getByRole('status')` text is `"No products found."`.

---

## Test file: tests/sorting.test.tsx

10. Selecting "Price: Low to High" (value `price-asc`) renders Jump Rope first and Noise-Cancelling Headphones last, count unchanged.
    - Verified by: After load, `userEvent.selectOptions(getByLabelText('Sort by'), 'Price: Low to High')`; query all level-3 headings (`getAllByRole('heading', { level: 3 })`); assert `[0].textContent` is `"Jump Rope"` and `[14].textContent` is `"Noise-Cancelling Headphones"`; assert `results-count` text is still `"Showing 15 products (page 1 of 1)"`.

11. Selecting "Price: High to Low" (value `price-desc`) renders Noise-Cancelling Headphones first and Jump Rope last.
    - Verified by: After load, select `'Price: High to Low'`; assert `getAllByRole('heading', { level: 3 })[0].textContent` is `"Noise-Cancelling Headphones"` and `[14].textContent` is `"Jump Rope"`.

12. Selecting "Rating" (value `rating-desc`) renders Yoga Mat first (rating 4.8) and Mechanical Keyboard second (rating 4.7).
    - Verified by: After load, select `'Rating'`; assert `getAllByRole('heading', { level: 3 })[0].textContent` is `"Yoga Mat"` and `[1].textContent` is `"Mechanical Keyboard"`.

13. With "Default" sort, products are in API order — Wireless Mouse first, Ergonomic Wrist Rest last.
    - Verified by: After load (default state, no sort change); assert `getAllByRole('heading', { level: 3 })[0].textContent` is `"Wireless Mouse"` and `[14].textContent` is `"Ergonomic Wrist Rest"`.

---

## Test file: tests/clearFilters.test.tsx

14. After applying a category filter, clicking "Clear filters" resets `results-count` to all 15 products.
    - Verified by: After load, select category "Fitness"; assert count is `"Showing 5 products (page 1 of 1)"`; click `getByRole('button', { name: 'Clear filters' })`; assert `results-count` text is `"Showing 15 products (page 1 of 1)"`.

15. Clicking "Clear filters" resets the search input value to empty, category to "All", inStockOnly checkbox to unchecked, and sortBy to "Default".
    - Verified by: After load, type in search, select a category, check in-stock, select a sort; click "Clear filters"; assert `getByLabelText('Search').value` is `""`; assert `getByLabelText('Category').value` is `"All"`; assert `getByLabelText('In-stock only').checked` is `false`; assert `getByLabelText('Sort by').value` is `"default"`.

---

## Test file: tests/pagination.test.tsx

16. On initial load with `totalPages=1`, both Prev and Next buttons are disabled.
    - Verified by: With default mock (`totalPages: 1`), after `findByTestId('results-count')`; assert `getByRole('button', { name: 'Prev' })` has `disabled` attribute; assert `getByRole('button', { name: 'Next' })` has `disabled` attribute.

17. With `totalPages=3`, Prev is disabled on page 1 and Next is enabled; after clicking Next (page 2), Prev becomes enabled and Next remains enabled.
    - Verified by: Override `global.fetch` with a mock returning `{ data: [...products], total: 15, page: 1, limit: 5, totalPages: 3 }`; after load, assert Prev is disabled and Next is not disabled; `userEvent.click(getByRole('button', { name: 'Next' }))`; wait for `results-count` to update to `page 2`; assert Prev is not disabled and Next is not disabled.

---

## Test file: tests/loadingError.test.tsx

18. While fetch is pending, the spinner (`aria-label="loading"`) is in the DOM and `results-count` is absent.
    - Verified by: `vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))`; render `<App />`; assert `getByLabelText('loading')` is present; assert `queryByTestId('results-count')` is null.

19. When fetch rejects, the spinner disappears and a `role="alert"` element with a non-empty error message appears.
    - Verified by: `vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))`; render `<App />`; `await screen.findByRole('alert')`; assert its `textContent` is `"Network error"`; assert `queryByLabelText('loading')` is null.

---

## Edge cases

- Search is case-insensitive: covered by requirement 5.
- Search matches partial names (e.g. "key" matches "Mechanical Keyboard"): covered by requirement 4 (the term "keyboard" is a partial match).
- Zero-result search produces the "No products found." status message: covered by requirement 9.
- Out-of-stock products excluded by in-stock filter — all four (USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp) are checked explicitly: covered by requirement 7.
- Combined filter (category + in-stock) is more restrictive than either alone: covered by requirement 8.
- Default sort preserves API response order (not alphabetical, not by id sort): covered by requirement 13.
- Tie-breaking in rating sort (Noise-Cancelling Headphones 4.6, Laptop Stand 4.6 appear after Mechanical Keyboard 4.7) — requirement 12 only asserts positions 0 and 1, so ties at lower ranks do not need exact position checks.
- Clear filters restores all controls simultaneously (not just count): covered by requirement 15.
- Pagination Prev disabled on first page, Next disabled on last page: covered by requirement 16.
- Pagination Prev enabled once past page 1: covered by requirement 17.
- `results-count` always uses plural "products" even for a count of 0 or 1: covered by requirements 4 and 9 (which check exact text including "1 products" and "0 products").
