# Requirements

## app.render.test.tsx

1. After `render(<App />)` and `await screen.findByTestId('results-count')`, the element's text content is exactly "Showing 15 products (page 1 of 1)".
   - Verified by: `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products (page 1 of 1)')` passes.

2. After initial load, specific product names from all three categories are present in the DOM — at minimum "Wireless Mouse" (Electronics), "Yoga Mat" (Fitness), and "Laptop Stand" (Accessories).
   - Verified by: `screen.getByText('Wireless Mouse')`, `screen.getByText('Yoga Mat')`, and `screen.getByText('Laptop Stand')` each return an element without throwing.

## filtering.test.tsx

3. Typing "keyboard" into the `#search` input (via `userEvent.type`) reduces the visible product list to 1 product and results-count reads "Showing 1 products (page 1 of 1)". The matched product name "Mechanical Keyboard" is in the DOM.
   - Verified by: `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products')` and `screen.getByText('Mechanical Keyboard')` both pass.

4. Selecting "Electronics" in the `#category` select reduces the visible list to exactly 5 products and results-count reads "Showing 5 products (page 1 of 1)".
   - Verified by: `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products')` passes.

5. Selecting "Fitness" in the `#category` select reduces the visible list to exactly 5 products and results-count reads "Showing 5 products (page 1 of 1)".
   - Verified by: `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products')` passes.

6. Selecting "Accessories" in the `#category` select reduces the visible list to exactly 5 products and results-count reads "Showing 5 products (page 1 of 1)".
   - Verified by: `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products')` passes.

7. Checking the `#inStockOnly` checkbox reduces the visible list to exactly 11 products (the 4 out-of-stock items excluded) and results-count reads "Showing 11 products (page 1 of 1)".
   - Verified by: `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products')` passes.

8. Combined filter — selecting "Electronics" in `#category` then checking `#inStockOnly` — shows exactly 3 products (Wireless Mouse, Mechanical Keyboard, Webcam HD) with results-count "Showing 3 products". The three in-stock Electronics names appear in the DOM; the two out-of-stock Electronics names (USB-C Hub, Noise-Cancelling Headphones) do not.
   - Verified by: `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 3 products')`, `screen.getByText('Wireless Mouse')`, `screen.getByText('Mechanical Keyboard')`, `screen.getByText('Webcam HD')` all pass; `screen.queryByText('USB-C Hub')` and `screen.queryByText('Noise-Cancelling Headphones')` return null.

## sorting.test.tsx

9. Selecting "Price: Low to High" (`price-asc`) in `#sortBy` places "Jump Rope" ($15) as the first product name rendered and "Noise-Cancelling Headphones" ($149) as the last.
   - Verified by: `getAllByRole('heading', ...)` or product name elements in DOM order — first element text is "Jump Rope", last element text is "Noise-Cancelling Headphones".

10. Selecting "Price: High to Low" (`price-desc`) in `#sortBy` places "Noise-Cancelling Headphones" ($149) first and "Jump Rope" ($15) last.
    - Verified by: product name elements in DOM order — first is "Noise-Cancelling Headphones", last is "Jump Rope".

11. Selecting "Rating" (`rating-desc`) in `#sortBy` places "Yoga Mat" (4.8) first and "Mechanical Keyboard" (4.7) second.
    - Verified by: product name elements in DOM order — index 0 is "Yoga Mat", index 1 is "Mechanical Keyboard".

12. With the default `#sortBy` value ("Default" / "default"), the products appear in their original fixture order: "Wireless Mouse" is the first product rendered.
    - Verified by: product name elements in DOM order — index 0 is "Wireless Mouse".

## clearFilters.test.tsx

13. After typing a search term into `#search` (reducing visible products) and clicking the "Clear filters" button: the `#search` input value is `""` and results-count returns to "Showing 15 products (page 1 of 1)".
    - Verified by: `expect(screen.getByLabelText('Search')).toHaveValue('')` and `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products')` both pass.

14. After selecting a non-"All" category in `#category` and clicking "Clear filters": the `#category` select value reverts to "All" and results-count shows "Showing 15 products (page 1 of 1)".
    - Verified by: `expect(screen.getByLabelText('Category')).toHaveValue('All')` and `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products')` both pass.

15. After checking `#inStockOnly` and clicking "Clear filters": the checkbox is unchecked and results-count shows "Showing 15 products (page 1 of 1)".
    - Verified by: `expect(screen.getByLabelText(/in-stock only/i)).not.toBeChecked()` and `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products')` both pass.

## pagination.test.tsx

16. After initial load (mock returns `totalPages: 1`, `page: 1`), the "Prev" button is present and disabled.
    - Verified by: `expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()` passes.

17. After initial load (mock returns `totalPages: 1`, `page: 1`), the "Next" button is present and disabled.
    - Verified by: `expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()` passes.

## loadingError.test.tsx

18. When the fetch promise never resolves (configured via `vi.mocked(global.fetch).mockImplementationOnce(() => new Promise(() => {}))`), rendering `<App />` immediately shows the spinner element (`div[aria-label="loading"]`) in the DOM, and `data-testid="results-count"` is absent.
    - Verified by: `screen.getByRole('generic', { name: 'loading' })` (or `screen.getByText('Loading…')`) returns an element; `screen.queryByTestId('results-count')` returns null.

19. When the fetch rejects with an `Error` (configured via `vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))`), awaiting `screen.findByRole('alert')` resolves to a paragraph containing the error message, and the spinner is no longer in the DOM.
    - Verified by: `await screen.findByRole('alert')` resolves; `screen.queryByText('Loading…')` returns null.

---

## Edge cases

- Search is case-insensitive (e.g. "KEYBOARD" matches "Mechanical Keyboard"): covered by requirement 3 (uses lowercase "keyboard"; implementation `toLowerCase()` handles case).
- Search matches substring, not full word (e.g. "key" matches "Mechanical Keyboard"): implicit in requirement 3's match logic — test uses a substring "keyboard".
- "Clear filters" also resets `sortBy` to "default": covered by requirements 13–15 (the clear handler passes `sortBy: 'default'` explicitly); any sort applied before clearing will also be reset.
- `#inStockOnly` filter excludes all 4 out-of-stock products (USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp): covered by requirement 7 (count 11) and requirement 8 (names absent).
- Default sort preserves fixture insertion order, not alphabetical: covered by requirement 12 (Wireless Mouse is first, matching products.ts order).
- Both Prev and Next are disabled simultaneously when totalPages = 1: covered by requirements 16 and 17 tested in the same initial-load state.
- Spinner disappears once fetch resolves (requirement 18 implicitly); error paragraph replaces spinner, not added alongside it (requirement 19).
