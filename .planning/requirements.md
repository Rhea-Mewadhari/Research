# Requirements

1. When `productId` changes from `null` to a non-null value, focus must be programmatically moved to the close button (`.detail-close-btn`) before the browser paints, implemented via `useLayoutEffect` reacting to the `isOpen` derived value.
   - Verified by: After `useLayoutEffect` runs, `document.activeElement` equals the close button DOM node (`panelRef.current?.querySelector('.detail-close-btn')`). The close button must receive a `ref` or be queried from `panelRef` for this to work.

2. A `useRef` (e.g., `prevFocusRef`) must capture `document.activeElement` at the moment the panel opens — inside the same `useLayoutEffect` that handles focus-on-open, before calling `.focus()` on the close button.
   - Verified by: The ref is assigned `document.activeElement` prior to calling `.focus()` on the close button within the `useLayoutEffect` body when `isOpen` is `true`.

3. When the panel closes (`isOpen` transitions from `true` to `false`), focus must be restored to the element captured in requirement 2 by calling `.focus()` on the stored `prevFocusRef.current`, provided it is an `HTMLElement` or `SVGElement`.
   - Verified by: After `onClose` is called and the panel unmounts, `document.activeElement` equals the element that triggered the open (e.g., the product card button that was clicked).

4. A `document`-level `keydown` event listener must be registered when the panel is open, calling `onClose` when `event.key === 'Escape'`. The listener must be attached via `addEventListener` on `document` (not via React's `onKeyDown` prop) so it fires regardless of which element has focus.
   - Verified by: Dispatching `new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })` on `document` while the panel is open causes `onClose` to be invoked.

5. The `document`-level Escape listener registered in requirement 4 must be removed when the panel closes or the component unmounts — implemented via the cleanup return of the `useEffect` that registers it.
   - Verified by: After `onClose` is called and the panel is no longer rendered, dispatching a second `keydown` Escape event on `document` does not trigger `onClose` again.

6. While the panel is open, pressing Tab must move focus to the next focusable element inside the panel, and pressing Shift+Tab must move focus to the previous. When Tab is pressed on the last focusable element, focus wraps to the first; when Shift+Tab is pressed on the first focusable element, focus wraps to the last. Focusable elements are those matching the selector: `button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`. Focus must not leave the panel to reach page elements behind it.
   - Verified by: A keydown handler on the panel div (or `document`) intercepts `Tab` and `Shift+Tab`, queries `panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)`, determines first/last, and calls `event.preventDefault()` + `element.focus()` to wrap or advance.

7. Clicking the backdrop (`.detail-backdrop`) must still call `onClose` — the existing `onClick={onClose}` on the backdrop must not be removed.
   - Verified by: `productDetailFocus.test.tsx` — the test "clicking the backdrop closes the panel" passes (`screen.queryByRole('dialog')` is `null` after backdrop click).

8. Clicking the close button must still call `onClose` — the existing `onClick={onClose}` on the close button must not be removed.
   - Verified by: `productDetailFocus.test.tsx` — the test "clicking the close button closes the panel" passes.

9. The scroll lock (`document.body.style.overflow = 'hidden'` on open, `''` on close) must continue to function unchanged.
   - Verified by: The existing scroll-lock `useEffect` remains unmodified; `pnpm test` in `src/benchmark-frontend` passes all four tests in `productDetailFocus.test.tsx`.

10. The component must use `ReactDOM.createPortal` into `document.body` — the portal mounting must not be changed.
    - Verified by: The `return ReactDOM.createPortal(…, document.body)` call remains in `ProductDetailPanel.tsx`; the test "clicking a product card opens the detail panel" passes (dialog is found in the document, not in the React tree root).

11. No new npm packages may be added — all focus management must be implemented inline in `ProductDetailPanel.tsx` only.
    - Verified by: `package.json` in `src/benchmark-frontend` is unchanged (no new entries in `dependencies` or `devDependencies`); no other source files are modified.

12. The TypeScript build must succeed with no type errors.
    - Verified by: `pnpm tsc --noEmit` exits with code 0 in `src/benchmark-frontend`.

13. All four visible tests in `src/benchmark-frontend/tests/productDetailFocus.test.tsx` must pass after the change.
    - Verified by: `pnpm test` in `src/benchmark-frontend` reports 0 failures for `productDetailFocus.test.tsx`.

---

## Edge cases

- Focus restore when previous element is no longer in the DOM: covered by requirement 3 — the `instanceof HTMLElement` guard prevents errors; if the element is gone, no restore is attempted.
- Panel opened while nothing meaningful has focus (e.g., `document.activeElement` is `document.body`): covered by requirement 2 — `document.body` is a valid restore target and `.focus()` on it is a no-op that still satisfies the contract.
- Panel with only one focusable element (just the close button, during loading): covered by requirement 6 — wrapping Tab on the last (= first) element returns focus to itself, which is correct.
- Escape pressed after panel closes (listener leak): covered by requirement 5 — the cleanup removes the listener, so no double-close occurs.
- Shift+Tab on the first element wraps to last: covered by requirement 6 — the handler checks `event.shiftKey` and wraps in reverse.
