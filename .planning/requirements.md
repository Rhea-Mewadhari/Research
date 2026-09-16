# Requirements

## Conventions applying to all tests
- Import `App` from `'../src/App'`
- Use `@testing-library/react` and `@testing-library/user-event`
- Always wait for load before interacting: `render(<App />); await screen.findByTestId('results-count');`
- The mock in `tests/setup.ts` stubs `global.fetch` to return all 15 products with `totalPages: 1`
- Do not modify any file under `src/`

---

## app.render.test.tsx

1. After the async initial load, `data-testid="results-count"` contains exactly the text
   `"Showing 15 products (page 1 of 1)"`.
   - Verified by: `expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products (page 1 of 1)')`

2. After the async initial load, all 15 product names from the fixture are present in the DOM.
   Fixture names: Wireless Mouse, USB-C Hub, Mechanical Keyboard, Webcam HD,
   Noise-Cancelling Headphones, Yoga Mat, Resistance Bands, Foam Roller, Dumbbell Set,
   Jump Rope, Laptop Stand, Desk Lamp, Cable Organiser, Monitor Riser, Ergonomic Wrist Rest.
   - Verified by: `screen.getByText('<name>')` succeeds for each of the 15 names

---

## filtering.test.tsx

3. Typing `"mouse"` into the search input (queried by label "Search", id="search") reduces the
   results-count to `"Showing 1 products (page 1 of 1)"` and "Wireless Mouse" is in the DOM.
   All other product names are absent.
   - Verified by: after `userEvent.type(searchInput, 'mouse')`, `getByTestId('results-count')` has
     text "Showing 1 products (page 1 of 1)", `getByText('Wireless Mouse')` succeeds,
     `queryByText('Yoga Mat')` returns null

4. Selecting `"Electronics"` from the category select (id="category") shows exactly 5 products:
   Wireless Mouse, USB-C Hub, Mechanical Keyboard, Webcam HD, Noise-Cancelling Headphones.
   results-count reads `"Showing 5 products (page 1 of 1)"`.
   - Verified by: after `userEvent.selectOptions(categorySelect, 'Electronics')`,
     `getByTestId('results-count')` has text "Showing 5 products (page 1 of 1)" and all 5 names
     are in the DOM; `queryByText('Yoga Mat')` returns null

5. Checking the "In-stock only" checkbox (id="inStockOnly") shows 11 products. The 4 out-of-stock
   products (USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp) are absent.
   results-count reads `"Showing 11 products (page 1 of 1)"`.
   - Verified by: after `userEvent.click(inStockCheckbox)`, `getByTestId('results-count')` has text
     "Showing 11 products (page 1 of 1)" and `queryByText('USB-C Hub')`,
     `queryByText('Noise-Cancelling Headphones')`, `queryByText('Dumbbell Set')`,
     `queryByText('Desk Lamp')` all return null

6. Combined filter: selecting `"Electronics"` category then checking "In-stock only" shows exactly
   3 products (Wireless Mouse, Mechanical Keyboard, Webcam HD); results-count reads
   `"Showing 3 products (page 1 of 1)"`.
   - Verified by: `getByTestId('results-count')` has text "Showing 3 products (page 1 of 1)";
     `getByText('Wireless Mouse')`, `getByText('Mechanical Keyboard')`, `getByText('Webcam HD')`
     succeed; `queryByText('USB-C Hub')` and `queryByText('Noise-Cancelling Headphones')` return null

---

## sorting.test.tsx

7. With `sortBy` set to `"Price: Low to High"` (value `"price-asc"`), products are ordered
   cheapest-first. The first rendered product card is "Jump Rope" ($15) and the last is
   "Noise-Cancelling Headphones" ($149).
   Full order: Jump Rope ($15), Cable Organiser ($18), Foam Roller ($22), Wireless Mouse ($25),
   Ergonomic Wrist Rest ($28), Resistance Bands ($30), Monitor Riser ($38), Yoga Mat ($40),
   Desk Lamp ($45), Laptop Stand ($55), USB-C Hub ($60), Webcam HD ($79), Dumbbell Set ($85),
   Mechanical Keyboard ($95), Noise-Cancelling Headphones ($149).
   - Verified by: after `userEvent.selectOptions(sortSelect, 'price-asc')`, `getAllByRole('article')`
     has first item containing text "Jump Rope" and last item containing text
     "Noise-Cancelling Headphones"

8. With `sortBy` set to `"Price: High to Low"` (value `"price-desc"`), products are ordered most
   expensive-first. The first card is "Noise-Cancelling Headphones" ($149) and the last is
   "Jump Rope" ($15).
   - Verified by: after `userEvent.selectOptions(sortSelect, 'price-desc')`, first article contains
     "Noise-Cancelling Headphones", last article contains "Jump Rope"

9. With `sortBy` set to `"Rating"` (value `"rating-desc"`), products are ordered highest-rated-first.
   The first card is "Yoga Mat" (4.8) and the second is "Mechanical Keyboard" (4.7).
   - Verified by: after `userEvent.selectOptions(sortSelect, 'rating-desc')`, first article contains
     "Yoga Mat", second article contains "Mechanical Keyboard"

10. Default sort (no sort action taken): products appear in fixture order — "Wireless Mouse" is the
    first rendered card and "Ergonomic Wrist Rest" is the last.
    - Verified by: immediately after `await screen.findByTestId('results-count')` with no sort
      interaction, first article contains "Wireless Mouse", last article contains
      "Ergonomic Wrist Rest"

---

## clearFilters.test.tsx

11. After typing `"mouse"` in the search input (results-count shows "Showing 1 products"),
    clicking the "Clear filters" button resets results-count to
    `"Showing 15 products (page 1 of 1)"` and the search input value becomes `""`.
    - Verified by: after `userEvent.click(screen.getByRole('button', {name: /clear filters/i}))`,
      `getByTestId('results-count')` has text "Showing 15 products (page 1 of 1)" and
      `getByRole('textbox', {name: /search/i})` has value `""`

---

## pagination.test.tsx

12. On initial load with `totalPages: 1` (as provided by mock), the "Prev" button is disabled and
    the "Next" button is disabled (page 1 of 1 means no valid navigation in either direction).
    - Verified by: `expect(screen.getByRole('button', {name: 'Prev'})).toBeDisabled()` and
      `expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled()`

---

## loadingError.test.tsx

13. Immediately after `render(<App />)` (before any `await`), the loading spinner element with
    `aria-label="loading"` is present in the DOM.
    - Verified by: `screen.getByLabelText('loading')` (or `getByRole('generic', {name: 'loading'})`)
      does not throw before `await screen.findByTestId('results-count')`

14. When `fetch` is overridden to reject with `new Error('Network error')`, after the failed
    load an element with `role="alert"` is rendered containing the text "Network error", and
    `data-testid="results-count"` is NOT in the DOM.
    - Verified by: override fetch in the test body via `vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))`;
      then `render(<App />)`; await an element with role="alert" via `screen.findByRole('alert')`;
      assert it has text "Network error"; assert `queryByTestId('results-count')` is null

---

## Edge cases

- Empty search (after clear): covered by requirement 11 — clearing resets to all 15 products
- Search is case-insensitive: covered by requirement 3 — `filterProducts` uses `.toLowerCase()` before matching; "mouse" matches "Wireless Mouse"
- All 4 out-of-stock products are individually absent after inStockOnly: covered by requirement 5
- Equal-rated products in rating-desc sort preserve stable insertion order: covered by requirement 9 — only the two unambiguously top-rated products (Yoga Mat 4.8, Mechanical Keyboard 4.7) are asserted by position to avoid flakiness
- Both pagination buttons disabled when exactly 1 total page: covered by requirement 12
- Loading state is present before async resolves and absent after: covered by requirements 13 and 1 together
- Fetch error suppresses results-count entirely: covered by requirement 14
