# Requirements

1. When `productId` changes from `null` to a non-null value, focus moves to the close button (`.detail-close-btn`) synchronously before the browser paints, using `useLayoutEffect` keyed on `productId`.
   - Verified by: `pnpm --filter benchmark-frontend test` passes; `productDetailFocus.test.tsx` "clicking a product card opens the detail panel" test confirms the panel opens. The `useLayoutEffect` implementation is inspectable in `ProductDetailPanel.tsx` — the effect must call `.focus()` on the close button ref when `productId` is non-null.

2. While the panel is open, pressing Tab on the last focusable element within the panel wraps focus to the first focusable element inside the panel (focus does not leave the panel). Focusable elements are those matching: `button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`.
   - Verified by: `pnpm --filter benchmark-frontend test` exits 0; the panel div's `onKeyDown` handler intercepts `Tab` (without Shift) when the active element is the last focusable element and calls `firstFocusable.focus()` with `event.preventDefault()`.

3. While the panel is open, pressing Shift+Tab on the first focusable element within the panel wraps focus to the last focusable element inside the panel.
   - Verified by: `pnpm --filter benchmark-frontend test` exits 0; the panel div's `onKeyDown` handler intercepts `Tab` with `event.shiftKey` when the active element is the first focusable element and calls `lastFocusable.focus()` with `event.preventDefault()`.

4. While the panel is open, pressing Escape calls `onClose`, regardless of which element on the page currently has focus. The listener is attached via `document.addEventListener('keydown', ...)` inside a `useEffect` that depends on `isOpen`, and is removed in the effect's cleanup function.
   - Verified by: `pnpm --filter benchmark-frontend test` exits 0; `ProductDetailPanel.tsx` must contain a `document.addEventListener` call for `'keydown'` (not only a React `onKeyDown` prop) that checks `event.key === 'Escape'` and calls `onClose`.

5. `document.activeElement` is captured into a ref immediately when the panel opens (inside the same `useLayoutEffect` that moves focus to the close button, before `.focus()` is called). When `isOpen` becomes false (panel closes for any reason — close button, backdrop, Escape), `.focus()` is called on the captured element if it is non-null.
   - Verified by: `pnpm --filter benchmark-frontend test` exits 0; `ProductDetailPanel.tsx` contains a `useRef` whose value is set to `document.activeElement` at open time and whose `.focus()` is invoked at close time.

6. Clicking the backdrop (`.detail-backdrop`) calls `onClose` and removes the dialog from the DOM.
   - Verified by: `productDetailFocus.test.tsx` — "clicking the backdrop closes the panel" — `screen.queryByRole('dialog')` returns null after the click.

7. `pnpm --filter benchmark-frontend build` exits with code 0 (no TypeScript errors, no Vite build errors). Only `src/components/ProductDetailPanel.tsx` is modified; no test files are touched.
   - Verified by: Running `pnpm --filter benchmark-frontend build` in CI/locally and observing exit code 0.

8. All five tests in `tests/productDetailFocus.test.tsx` pass when running `pnpm --filter benchmark-frontend test`.
   - Verified by: `pnpm --filter benchmark-frontend test` output shows 5 passing tests in `productDetailFocus.test.tsx` and no failures across any test file.

---

## Edge cases

- **Escape when focus is outside the panel**: Covered by requirement 4 — the `document`-level listener fires unconditionally, not only when a panel element is focused.
- **Focus trap with one focusable element**: Tab and Shift+Tab on the sole focusable element both wrap back to it (no-op movement). Covered by requirements 2 and 3 — the wrap logic applies to first === last.
- **Focus restore when no element had focus before open**: `document.activeElement` may be `null` or `document.body`. Covered by requirement 5 — the restore call must be guarded (`if (prevEl) prevEl.focus()`) so it does not throw.
- **Backdrop close triggers focus restore**: When the backdrop is clicked, `onClose` is called, which sets `productId` to null, which causes `isOpen` to become false and the restore-focus path to run. Covered by requirements 5 and 6 together.
- **`productId` switches between two non-null values**: A new open event fires, capturing the new `document.activeElement` and re-focusing the close button. Covered by requirement 1 — `useLayoutEffect` depends on `productId`, so it re-runs on each change.
