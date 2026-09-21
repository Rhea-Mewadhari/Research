# Requirements

1. When `productId` changes from `null` to a non-null value, focus moves to the close button (`aria-label="Close panel"`) before the user can interact with the panel.
   - Verified by: `productDetailFocus.test.tsx` — after opening the panel, `document.activeElement` equals the close button element (or a test that checks `screen.getByRole('button', { name: /close panel/i })` has focus via `toHaveFocus()`).

2. While the panel is open, pressing Tab on the last focusable element inside the panel wraps focus to the first focusable element inside the panel, and does not move focus to any element outside the panel.
   - Verified by: `productDetailFocus.test.tsx` — after opening the panel, successive Tab presses cycle only among elements inside the `role="dialog"` container; no element outside the dialog ever receives focus.

3. While the panel is open, pressing Shift+Tab on the first focusable element inside the panel wraps focus to the last focusable element inside the panel, and does not move focus to any element outside the panel.
   - Verified by: `productDetailFocus.test.tsx` — pressing Shift+Tab from the close button (first focusable element) moves focus to the last focusable element inside the dialog, not to any element outside.

4. The Escape key listener is attached to `document` (not to a React `onKeyDown` prop), so it fires regardless of which element on the page holds focus when the panel is open.
   - Verified by: `productDetailFocus.test.tsx` — pressing Escape while focus is on an element outside the panel still calls `onClose` and removes the dialog from the DOM.

5. Pressing Escape while the panel is open calls `onClose`, causing the dialog to be removed from the DOM.
   - Verified by: `productDetailFocus.test.tsx` — after `keydown` of `Escape`, `screen.queryByRole('dialog')` returns `null`.

6. The `document`-level Escape key listener is removed when the panel closes (either via Escape, close button, or backdrop click), so no stale listener fires after the panel is gone.
   - Verified by: `productDetailFocus.test.tsx` — after the panel closes, a subsequent Escape keydown does not trigger any `onClose` call (spy call count does not increase).

7. The element that had focus immediately before the panel opened receives focus again after the panel closes (regardless of how it closes: close button, Escape, or backdrop click).
   - Verified by: `productDetailFocus.test.tsx` — after clicking a product card to open the panel and then closing via any mechanism, `document.activeElement` equals the product card element that was clicked.

8. Focus is captured at open time (when `productId` changes from `null` to non-null), not at close time, so the correct element is restored even if focus has moved inside the panel before closing.
   - Verified by: `productDetailFocus.test.tsx` — after opening the panel (triggering element A), pressing Tab inside the panel to move focus to a different element, then closing, `document.activeElement` equals element A (not the last focused element inside the panel).

9. The backdrop click still closes the panel (`onClose` is called and the dialog is removed from the DOM).
   - Verified by: `productDetailFocus.test.tsx` — existing test "clicking the backdrop closes the panel" passes without modification.

10. The panel continues to render via `ReactDOM.createPortal` into `document.body`, and scroll lock (`document.body.style.overflow = 'hidden'`) remains in effect while the panel is open.
    - Verified by: running `npm test` in `src/benchmark-frontend` — all existing tests in `productDetailFocus.test.tsx` pass; build (`npm run build`) exits with code 0.

11. No new npm packages are added. Focus management is implemented directly in `ProductDetailPanel.tsx` without introducing external focus-trap libraries.
    - Verified by: `package.json` and `package-lock.json` in `src/benchmark-frontend` are unchanged; `git diff --name-only` does not include any package manifest changes.

12. Only `src/benchmark-frontend/src/components/ProductDetailPanel.tsx` is modified. `ProductListPage.tsx`, `ProductCard.tsx`, context files, and test files are unchanged.
    - Verified by: `git diff --name-only` lists only `src/benchmark-frontend/src/components/ProductDetailPanel.tsx`.

---

## Edge cases

- Tab wrapping with a single focusable element (only the close button is focusable): covered by requirement 2 — Tab and Shift+Tab must both stay on that element.
- Panel closes while focus is on an element that has since been removed from the DOM: covered by requirement 7 — focus restore targets the element captured at open time; if it is no longer in the DOM, `focus()` is a no-op (no error thrown).
- Escape pressed when the panel is already closed (stale listener): covered by requirement 6 — cleanup removes the listener on close.
- `document.activeElement` is `null` or `document.body` when the panel opens (no meaningful trigger element): covered by requirement 7 — focus restore calls `focus()` on whatever was captured; `document.body.focus()` is a safe no-op.
- Panel opens with data still loading (only the close button is rendered): covered by requirement 2 — focus trap applies to whichever focusable elements exist at the time of each keypress, not a fixed snapshot.
