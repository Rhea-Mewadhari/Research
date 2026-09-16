# Requirements

## Product fixture facts (from `src/data/products.ts`)

- 15 products total
- Categories: Electronics (5), Fitness (5), Accessories (5)
- Out of stock (4): USB-C Hub (id=2), Noise-Cancelling Headphones (id=5), Dumbbell Set (id=9), Desk Lamp (id=12)
- In stock: 11
- Cheapest: Jump Rope ($15) · Most expensive: Noise-Cancelling Headphones ($149)
- Highest rated: Yoga Mat (4.8), then Mechanical Keyboard (4.7)
- Default array order (first 3): Wireless Mouse, USB-C Hub, Mechanical Keyboard

## DOM contract (from reading the source)

| Selector | Meaning |
|---|---|
| `data-testid="results-count"` | `Showing {N} products (page {P} of {T})` |
| `#search` | Text input for name search |
| `#category` | Select for category (All / Electronics / Fitness / Accessories) |
| `#inStockOnly` | Checkbox for in-stock filter |
| `#sortBy` | Select for sort (default / price-asc / price-desc / rating-desc) |
| Button text "Clear filters" | Resets all filters to initial state |
| Button text "Prev" | Previous page; disabled when `page <= 1` |
| Button text "Next" | Next page; disabled when `page >= totalPages` |
| `data-testid="product-{id}"` | Article element for each product card |
| `h3` inside each card | Product name |
| `section[aria-label="Product results"]` | Product grid (present when ≥1 result) |
| `p[role="status"]` | "No products found." (present when 0 results) |
| `div[aria-label="loading"]` | Spinner during fetch |
| `p[role="alert"]` | Fetch error message |

---

## tests/app.render.test.tsx

1. After awaiting `data-testid="results-count"`, the page heading "Product Catalog" is visible.
   - Verified by: `screen.getByRole('heading', { level: 1 })` has text content "Product Catalog"; test passes in `pnpm test`.

2. After awaiting `data-testid="results-count"`, the results-count element contains the text "Showing 15 products (page 1 of 1)".
   - Verified by: `screen.getByTestId('results-count')` has text content matching "Showing 15 products (page 1 of 1)"; test passes in `pnpm test`.

3. After awaiting `data-testid="results-count"`, all 15 product cards are present in the DOM (`data-testid="product-1"` through `data-testid="product-15"`).
   - Verified by: `screen.getAllByRole('heading', { level: 3 })` returns an array of length 15; test passes in `pnpm test`.

---

## tests/filtering.test.tsx

4. Typing "Yoga" into the `#search` input (after initial load) reduces the results-count to "Showing 1 products (page 1 of 1)" and only the h3 "Yoga Mat" is visible in `section[aria-label="Product results"]`.
   - Verified by: `screen.getByTestId('results-count')` text matches "Showing 1 products"; `screen.getAllByRole('heading', { level: 3 })` length is 1 and its text is "Yoga Mat"; test passes in `pnpm test`.

5. Search is case-insensitive: typing "yoga" (lowercase) also shows only "Yoga Mat".
   - Verified by: after typing "yoga", `screen.getAllByRole('heading', { level: 3 })` has length 1 with text "Yoga Mat"; test passes in `pnpm test`.

6. Typing a term with no matches (e.g. "zzz") renders `<p role="status">No products found.</p>` and removes `section[aria-label="Product results"]` from the DOM.
   - Verified by: `screen.getByRole('status')` has text "No products found."; `screen.queryByRole('region')` (the products section) is null or the section is not present; test passes in `pnpm test`.

7. Selecting "Electronics" from the `#category` select results in "Showing 5 products (page 1 of 1)" and exactly 5 product cards rendered.
   - Verified by: `screen.getByTestId('results-count')` text is "Showing 5 products (page 1 of 1)"; `screen.getAllByRole('heading', { level: 3 })` length is 5; test passes in `pnpm test`.

8. Selecting "Fitness" from the `#category` select results in "Showing 5 products (page 1 of 1)".
   - Verified by: `screen.getByTestId('results-count')` text is "Showing 5 products (page 1 of 1)"; test passes in `pnpm test`.

9. Selecting "Accessories" from the `#category` select results in "Showing 5 products (page 1 of 1)".
   - Verified by: `screen.getByTestId('results-count')` text is "Showing 5 products (page 1 of 1)"; test passes in `pnpm test`.

10. Checking the `#inStockOnly` checkbox results in "Showing 11 products (page 1 of 1)" and the four out-of-stock products (USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp) are absent from the DOM.
    - Verified by: `screen.getByTestId('results-count')` text is "Showing 11 products (page 1 of 1)"; `screen.queryByText('USB-C Hub')` is null and equivalents for the other three out-of-stock names; test passes in `pnpm test`.

11. Combined filter — selecting "Electronics" AND checking `#inStockOnly` results in "Showing 3 products (page 1 of 1)" (Wireless Mouse, Mechanical Keyboard, Webcam HD are the three in-stock Electronics products).
    - Verified by: `screen.getByTestId('results-count')` text is "Showing 3 products (page 1 of 1)"; `screen.getAllByRole('heading', { level: 3 })` length is 3; test passes in `pnpm test`.

12. Combined filter — typing "keyboard" into `#search` AND selecting "Electronics" results in "Showing 1 products" with only "Mechanical Keyboard" visible.
    - Verified by: `screen.getByTestId('results-count')` text matches "Showing 1 products"; `screen.getByText('Mechanical Keyboard')` is in the document; test passes in `pnpm test`.

---

## tests/sorting.test.tsx

13. Selecting "Price: Low to High" (value `price-asc`) from `#sortBy` makes "Jump Rope" the first h3 and "Noise-Cancelling Headphones" the last h3 across all 15 rendered product cards.
    - Verified by: `screen.getAllByRole('heading', { level: 3 })[0]` has text "Jump Rope"; `[14]` has text "Noise-Cancelling Headphones"; test passes in `pnpm test`.

14. Selecting "Price: High to Low" (value `price-desc`) from `#sortBy` makes "Noise-Cancelling Headphones" first and "Jump Rope" last.
    - Verified by: `screen.getAllByRole('heading', { level: 3 })[0]` has text "Noise-Cancelling Headphones"; `[14]` has text "Jump Rope"; test passes in `pnpm test`.

15. Selecting "Rating" (value `rating-desc`) from `#sortBy` makes "Yoga Mat" the first h3 and "Mechanical Keyboard" the second h3.
    - Verified by: `screen.getAllByRole('heading', { level: 3 })[0]` has text "Yoga Mat"; `[1]` has text "Mechanical Keyboard"; test passes in `pnpm test`.

16. With `#sortBy` at its initial "Default" value, the first product h3 is "Wireless Mouse" (original array order preserved).
    - Verified by: `screen.getAllByRole('heading', { level: 3 })[0]` has text "Wireless Mouse"; test passes in `pnpm test`.

---

## tests/clearFilters.test.tsx

17. After typing "Yoga" into `#search` (reducing results to 1), clicking "Clear filters" resets the results-count to "Showing 15 products (page 1 of 1)" and the `#search` input value is "".
    - Verified by: after click, `screen.getByTestId('results-count')` text is "Showing 15 products (page 1 of 1)"; `screen.getByRole('textbox', { name: /search/i })` value is ""; test passes in `pnpm test`.

18. After selecting "Fitness" from `#category`, clicking "Clear filters" sets `#category` back to "All" and shows 15 products.
    - Verified by: after click, `screen.getByRole('combobox', { name: /category/i })` value is "All"; `screen.getByTestId('results-count')` text is "Showing 15 products (page 1 of 1)"; test passes in `pnpm test`.

19. After checking `#inStockOnly`, clicking "Clear filters" unchecks the checkbox and shows 15 products.
    - Verified by: after click, `screen.getByRole('checkbox', { name: /in-stock only/i })` is not checked; results-count shows 15 products; test passes in `pnpm test`.

20. After changing `#sortBy` to "price-asc", clicking "Clear filters" resets it to "Default" (value "default") and the first product is "Wireless Mouse" again.
    - Verified by: after click, `screen.getByRole('combobox', { name: /sort by/i })` value is "default"; `screen.getAllByRole('heading', { level: 3 })[0]` text is "Wireless Mouse"; test passes in `pnpm test`.

---

## tests/pagination.test.tsx

21. On initial render (mock returns `totalPages: 1`, `page: 1`), the "Prev" button is disabled.
    - Verified by: `screen.getByRole('button', { name: 'Prev' })` has the `disabled` attribute; test passes in `pnpm test`.

22. On initial render (mock returns `totalPages: 1`, `page: 1`), the "Next" button is disabled.
    - Verified by: `screen.getByRole('button', { name: 'Next' })` has the `disabled` attribute; test passes in `pnpm test`.

23. When the fetch mock is overridden to return `totalPages: 2` for the first call and `totalPages: 2` for subsequent calls, the "Next" button is enabled on page 1.
    - Verified by: `screen.getByRole('button', { name: 'Next' })` does not have `disabled`; test passes in `pnpm test`.

24. After clicking "Next" when `totalPages: 2`, the "Prev" button becomes enabled.
    - Verified by: after clicking Next, `screen.getByRole('button', { name: 'Prev' })` does not have `disabled`; test passes in `pnpm test`.

---

## tests/loadingError.test.tsx

25. Before the fetch resolves (immediately after `render(<App />)` without awaiting), `div[aria-label="loading"]` is present in the DOM.
    - Verified by: `screen.getByRole('img', { hidden: true })` or `screen.getByLabelText('loading')` is in the document before `findByTestId('results-count')` resolves; test passes in `pnpm test`.

26. When the fetch mock is overridden to reject with `new Error('Network error')`, a `p[role="alert"]` element appears containing the text "Network error" and the loading spinner is absent.
    - Verified by: `screen.findByRole('alert')` resolves and has text content "Network error"; `screen.queryByLabelText('loading')` is null; test passes in `pnpm test`.

---

## Overall

27. Running `pnpm test` from the `src/benchmark-frontend` directory produces zero failing tests and all six test files report at least one passing test each.
    - Verified by: `pnpm test` exit code is 0; test output shows passing suites for `app.render.test.tsx`, `filtering.test.tsx`, `sorting.test.tsx`, `clearFilters.test.tsx`, `pagination.test.tsx`, `loadingError.test.tsx`.

---

## Edge cases

- Case-insensitive search: covered by requirement 5
- Empty search string matches all products (no filtering): covered by requirements 2 and 17 (after clear, all 15 show)
- Filtering produces zero results → "No products found." status: covered by requirement 6
- Out-of-stock products excluded from in-stock filter: covered by requirement 10
- Sort preserves all 15 results (count unchanged): covered by requirements 13–16 (all check 15 h3 headings)
- Combined filters applied simultaneously: covered by requirements 11 and 12
- Clear filters resets ALL four filter fields simultaneously: covered by requirements 17–20 (each verifies a distinct field)
- Prev disabled on first page: covered by requirement 21
- Next disabled on last page: covered by requirement 22
- Both Prev and Next disabled when totalPages=1: requirements 21 and 22 together
- Loading state is transient (replaced by results or error, never both): covered by requirements 25 and 26
- Error state shows alert, not spinner: covered by requirement 26
