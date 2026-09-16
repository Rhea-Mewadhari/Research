# Requirements

## File: tests/app.render.test.tsx

1. After `<App />` renders and the async fetch resolves, the element with `data-testid="results-count"` contains the text "Showing 15 products (page 1 of 1)".
   - Verified by: `screen.findByTestId('results-count')` resolves and `toHaveTextContent('Showing 15 products (page 1 of 1)')` passes.

2. After load, the heading "Product Catalog" is present in the document.
   - Verified by: `screen.getByRole('heading', { name: /Product Catalog/i })` does not throw.

3. After load, the filter controls are present: search input (`id="search"`), category select (`id="category"`), in-stock checkbox (`id="inStockOnly"`), and a "Clear filters" button.
   - Verified by: `screen.getByLabelText(/search/i)`, `screen.getByLabelText(/category/i)`, `screen.getByLabelText(/in-stock only/i)`, and `screen.getByRole('button', { name: /clear filters/i })` each resolve without throwing.

---

## File: tests/filtering.test.tsx

4. Typing "Yoga" into the search input reduces the results-count to "Showing 1 products" and the product card for "Yoga Mat" is visible.
   - Verified by: after `userEvent.type(searchInput, 'Yoga')`, `results-count` text content matches `/Showing 1 products/` and `screen.getByText('Yoga Mat')` does not throw.

5. Search is case-insensitive: typing "yoga" (lowercase) also shows 1 product and "Yoga Mat" is visible.
   - Verified by: same assertions as requirement 4 with input value "yoga".

6. Selecting "Electronics" in the category select shows exactly 5 products.
   - Verified by: after `userEvent.selectOptions(categorySelect, 'Electronics')`, `results-count` text content matches `/Showing 5 products/`.

7. Selecting "Fitness" in the category select shows exactly 5 products.
   - Verified by: after `userEvent.selectOptions(categorySelect, 'Fitness')`, `results-count` text content matches `/Showing 5 products/`.

8. Selecting "Accessories" in the category select shows exactly 5 products.
   - Verified by: after `userEvent.selectOptions(categorySelect, 'Accessories')`, `results-count` text content matches `/Showing 5 products/`.

9. Clicking the in-stock checkbox shows exactly 11 products (the 4 out-of-stock items are hidden).
   - Verified by: after `userEvent.click(inStockCheckbox)`, `results-count` text content matches `/Showing 11 products/`.

10. Selecting "Electronics" and checking in-stock shows exactly 3 products (Wireless Mouse, Mechanical Keyboard, Webcam HD).
    - Verified by: after both interactions, `results-count` matches `/Showing 3 products/`, and `screen.getByText('Wireless Mouse')`, `screen.getByText('Mechanical Keyboard')`, `screen.getByText('Webcam HD')` each do not throw.

11. Typing "Headphones" in search and checking in-stock shows 0 products and the "No products found." status message appears.
    - Verified by: `results-count` matches `/Showing 0 products/` and `screen.getByRole('status')` contains "No products found.".

---

## File: tests/sorting.test.tsx

12. Selecting "Price: Low to High" in the sort select causes Jump Rope to appear first among all rendered product articles.
    - Verified by: after `userEvent.selectOptions(sortSelect, 'price-asc')`, `screen.getAllByRole('article')[0]` has `data-testid="product-10"` (Jump Rope, id=10, $15).

13. Selecting "Price: High to Low" causes Noise-Cancelling Headphones to appear first.
    - Verified by: after `userEvent.selectOptions(sortSelect, 'price-desc')`, `screen.getAllByRole('article')[0]` has `data-testid="product-5"` (Noise-Cancelling Headphones, id=5, $149).

14. Selecting "Rating" causes Yoga Mat to appear first and Mechanical Keyboard to appear second.
    - Verified by: after `userEvent.selectOptions(sortSelect, 'rating-desc')`, `screen.getAllByRole('article')[0]` has `data-testid="product-6"` (Yoga Mat, 4.8) and `[1]` has `data-testid="product-3"` (Mechanical Keyboard, 4.7).

15. Default sort order renders Wireless Mouse as the first product (matches source array order).
    - Verified by: on initial load (no sort interaction), `screen.getAllByRole('article')[0]` has `data-testid="product-1"` (Wireless Mouse).

---

## File: tests/clearFilters.test.tsx

16. After applying a search filter ("Yoga", showing 1 product), clicking "Clear filters" resets results-count to "Showing 15 products".
    - Verified by: after typing "Yoga" then clicking the clear button, `results-count` text content matches `/Showing 15 products/`.

17. After clicking "Clear filters", the search input value is empty, the category select value is "All", the in-stock checkbox is unchecked, and the sort select value is "default".
    - Verified by: `searchInput.value === ''`, `categorySelect.value === 'All'`, `inStockCheckbox.checked === false`, `sortSelect.value === 'default'`.

18. After applying a category filter ("Electronics", showing 5 products), clicking "Clear filters" resets results-count to "Showing 15 products".
    - Verified by: after selecting "Electronics" then clicking the clear button, `results-count` text content matches `/Showing 15 products/`.

---

## File: tests/pagination.test.tsx

19. On initial load (page=1, totalPages=1 from mock), the "Prev" button is disabled.
    - Verified by: after `screen.findByTestId('results-count')`, `screen.getByRole('button', { name: /prev/i })` has the `disabled` attribute (`toBeDisabled()` passes).

20. On initial load (page=1, totalPages=1 from mock), the "Next" button is disabled.
    - Verified by: after `screen.findByTestId('results-count')`, `screen.getByRole('button', { name: /next/i })` has the `disabled` attribute (`toBeDisabled()` passes).

---

## File: tests/loadingError.test.tsx

21. While the fetch is pending (not yet resolved), the spinner element with `aria-label="loading"` is present in the document.
    - Verified by: render `<App />` without awaiting load; `screen.getByLabelText('loading')` does not throw immediately after render.

22. After the fetch resolves successfully, the spinner is removed from the document and `data-testid="results-count"` is visible.
    - Verified by: after `screen.findByTestId('results-count')` resolves, `screen.queryByLabelText('loading')` returns null.

23. When the fetch mock rejects with `new Error('Network error')`, a `role="alert"` element is rendered containing the error message text, and `data-testid="results-count"` is not present.
    - Verified by: override `global.fetch` to reject, render `<App />`, `await screen.findByRole('alert')` resolves and its text content includes "Network error"; `screen.queryByTestId('results-count')` returns null.

24. When the fetch mock resolves with `{ ok: false }`, the app renders an error alert and does not show the results-count.
    - Verified by: override `global.fetch` to return `{ ok: false, json: async () => ({}) }`, render `<App />`, `screen.queryByTestId('results-count')` never appears and `screen.findByRole('alert')` resolves.

---

## Edge cases

- Empty search string (user clears input after typing): covered by requirement 16 (clear filters resets search to "").
- Search term that matches zero products: covered by requirement 11 (Headphones + in-stock = 0 results; "No products found." status shown).
- Case insensitivity of search: covered by requirement 5.
- All categories produce same count (5 each): covered by requirements 6, 7, 8.
- Sort order ties (rating-desc, second place): covered by requirement 14 (Mechanical Keyboard 4.7 confirmed second).
- Loading state is visible before fetch settles, not just after: covered by requirement 21 (checked synchronously after render).
- Fetch rejection vs ok:false error path: covered by requirements 23 and 24 separately.
- Prev button disabled at page 1 boundary: covered by requirement 19.
- Next button disabled when totalPages equals current page: covered by requirement 20.
