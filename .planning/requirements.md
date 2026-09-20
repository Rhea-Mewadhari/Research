# Requirements

1. When `productId` changes from `null` to a non-null value (panel opens), `document.activeElement` must be the close button (the `<button aria-label="Close panel">` / `.detail-close-btn`) by the time the first paint completes.
   - Verified by: Code inspection of `ProductDetailPanel.tsx` — a `useEffect` or `useLayoutEffect` with `isOpen` (or `productId`) in its dependency array calls `.focus()` on the close button element (obtained via a dedicated `useRef` on the button, or via `panelRef.current?.querySelector('.detail-close-btn')`).

2. While the panel is open, pressing Tab when the **last** focusable element inside `panelRef.current` has focus must move focus to the **first** focusable element inside the panel and must not allow focus to leave the panel. Focusable elements are those matching: `button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`.
   - Verified by: Code inspection of `ProductDetailPanel.tsx` — a `keydown` handler (attached to `document` or `panelRef.current`) intercepts `Tab` (when `event.shiftKey` is `false`), queries all matching focusable elements inside `panelRef.current`, calls `event.preventDefault()` and shifts focus to `focusable[0]` when the currently focused element is `focusable[focusable.length - 1]`.

3. While the panel is open, pressing Shift+Tab when the **first** focusable element inside the panel has focus must move focus to the **last** focusable element inside the panel.
   - Verified by: Code inspection of `ProductDetailPanel.tsx` — the same `keydown` handler intercepts `Tab` when `event.shiftKey` is `true`, calls `event.preventDefault()` and shifts focus to `focusable[focusable.length - 1]` when the currently focused element is `focusable[0]`.

4. Pressing Escape at any time while the panel is open must call `onClose`, regardless of which element on the page currently has focus.
   - Verified by: Code inspection of `ProductDetailPanel.tsx` — `document.addEventListener('keydown', ...)` is used (not a React `onKeyDown` attribute on any JSX element); the handler checks `event.key === 'Escape'` and calls `onClose()`.

5. The element that held focus immediately before the panel opened must receive focus again when the panel closes (via close button, backdrop click, or Escape). The previous-focus element must be captured at **open time**, not at close time.
   - Verified by: Code inspection of `ProductDetailPanel.tsx` — a `useLayoutEffect` triggered when `isOpen` becomes `true` reads `document.activeElement` and stores it in a `useRef`; a `useEffect` cleanup or a separate effect triggered when `isOpen` becomes `false` calls `.focus()` on the stored ref value.

6. The `document` keydown listener added for the Escape handler must be removed when the panel closes (`isOpen` becomes `false`) and when the component unmounts.
   - Verified by: Code inspection of `ProductDetailPanel.tsx` — the `useEffect` that calls `document.addEventListener` for Escape returns a cleanup function that calls `document.removeEventListener` with the same handler reference.

7. No new npm dependencies are introduced.
   - Verified by: `src/benchmark-frontend/package.json` `dependencies` and `devDependencies` are identical to the pre-task state (no new packages added).

8. `ProductDetailPanel.tsx` continues to render the panel via `ReactDOM.createPortal` into `document.body`.
   - Verified by: Code inspection — `ReactDOM.createPortal(` is present in the return value of `ProductDetailPanel`, mounting into `document.body`.

9. The scroll-lock behaviour (`document.body.style.overflow = 'hidden'` while open, reset to `''` on close) is preserved unchanged.
   - Verified by: Code inspection — the existing scroll-lock `useEffect` block in `ProductDetailPanel.tsx` is present and unmodified.

10. All tests in `src/benchmark-frontend/tests/productDetailFocus.test.tsx` pass without modifying that file.
    - Verified by: Run `pnpm --filter benchmark-frontend test --run`; all 5 tests exit green (0 failures, 0 errors).

11. The TypeScript build completes without type errors.
    - Verified by: Run `pnpm --filter benchmark-frontend build`; process exits with code 0.

---

## Edge cases

- **Single focusable element (only the close button)**: Tab and Shift+Tab both cycle back to the close button itself — covered by requirements 2 and 3 (first and last are the same element).
- **No prior focused element at open time (`document.activeElement === document.body`)**: Calling `.focus()` on `document.body` on close is acceptable (no crash); the requirement does not mandate a visible focus ring on `body` — covered by requirement 5.
- **Escape pressed while focus is on a background page element**: `onClose` is still called because the listener is on `document` — covered by requirement 4.
- **Panel closed via backdrop click**: Focus is still restored to the triggering element (because capture happens at open time, not close time) — covered by requirement 5.
- **Panel closed via close button click**: Focus is still restored to the triggering element — covered by requirement 5.
- **`productId` changes between two non-null values (panel swaps product without closing)**: Previous-focus capture must only re-run when `isOpen` transitions from `false` to `true`, not on every `productId` change — covered by requirement 5 (capture on open, not on every render).
