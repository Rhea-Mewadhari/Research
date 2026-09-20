# Requirements

1. When `productId` changes from `null` to a non-null value, `document.activeElement` must be the close button (`button[aria-label="Close panel"]`) by the time the browser paints the panel.
   - Verified by: render `<App>`, open a panel via `userEvent.click`, then assert `document.activeElement === screen.getByRole('button', { name: /close panel/i })`.

2. While the panel is open, pressing Tab on the last focusable element inside the panel wraps focus to the first focusable element inside the panel (focus never escapes to elements behind the panel).
   - Verified by: open the panel; `userEvent.tab()` repeatedly until the cycle wraps; confirm every focused element is a descendant of `document.querySelector('[role="dialog"]')` and that `document.activeElement` returns to the first focusable element after the last.

3. While the panel is open, pressing Shift+Tab on the first focusable element inside the panel wraps focus to the last focusable element inside the panel.
   - Verified by: open the panel; confirm focus starts on the close button (first focusable); `userEvent.tab({ shift: true })`; confirm `document.activeElement` is the last focusable element inside the panel.

4. Pressing Escape at any time while the panel is open calls `onClose`, regardless of which element on the page has focus. The keydown listener is attached to `document` (not to a React element via `onKeyDown`).
   - Verified by: open the panel; move focus to an element outside the panel (e.g. `document.body.focus()`); dispatch `new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })` on `document`; assert `onClose` was called and `screen.queryByRole('dialog')` returns `null`.

5. When the panel closes, focus returns to the element that had focus immediately before the panel opened (captured at open time, not at close time).
   - Verified by: focus a product card element; open the panel; close the panel (via close button or Escape); assert `document.activeElement` is the same product card element that had focus before the panel opened.

6. The `document` keydown listener added for Escape handling is removed when the panel closes or unmounts (no listener leak).
   - Verified by: open then close the panel; dispatch `new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })` on `document` again; assert `onClose` is NOT called a second time.

7. The focusable elements query inside the trap uses exactly this selector:
   `button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`
   - Verified by: inspect the implementation in `ProductDetailPanel.tsx` — the selector string is present verbatim, or elements matching each category are cycled correctly in the Tab-wrap test (requirement 2).

8. No new entries are added to `benchmark-frontend/package.json` dependencies or devDependencies (focus management must use native DOM APIs only).
   - Verified by: `git diff HEAD -- src/benchmark-frontend/package.json` shows no added dependency lines.

9. The panel continues to render via `ReactDOM.createPortal` into `document.body` (mounting mechanism is unchanged).
   - Verified by: the existing `productDetailFocus.test.tsx` suite passes — all four tests (`clicking a product card opens the detail panel`, `panel contains a close button`, `clicking the close button closes the panel`, `clicking the backdrop closes the panel`) remain green.

10. The scroll lock (`document.body.style.overflow = 'hidden'`) remains active while the panel is open and is cleared when the panel closes.
    - Verified by: open the panel; assert `document.body.style.overflow === 'hidden'`; close the panel; assert `document.body.style.overflow === ''`.

11. All visible tests pass and the TypeScript build succeeds with no errors.
    - Verified by: `pnpm --filter benchmark-frontend test` exits with code 0; `pnpm --filter benchmark-frontend build` exits with code 0.

---

## Edge cases

- Only `ProductDetailPanel.tsx` is modified: covered by requirement 8 (no new packages) and the constraint that `ProductListPage.tsx`, `ProductCard.tsx`, and context files are untouched.
- Panel opens while another panel transition is in-flight (rapid `productId` change): focus capture is per `useLayoutEffect` run on `isOpen` becoming `true`; the last captured element wins — covered by requirement 5.
- No focusable elements other than the close button exist yet (panel still loading): Tab must wrap back to the close button immediately — covered by requirement 2 (only one focusable element means wrap to itself).
- `document.activeElement` is `null` or `document.body` when the panel opens: focus restore on close must silently skip rather than throw — covered by requirement 5 (restore only the captured element; if it has no `focus()` method, no-op).
- Pressing Escape after the panel has already closed must not call `onClose` again: covered by requirement 6.
