# Task 10: Logical Bug — Focus Management in ProductDetailPanel

## Objective

Implement keyboard accessibility for `ProductDetailPanel`: move focus into the panel when it opens, trap Tab navigation inside it, close it on Escape, and return focus to the triggering element when it closes.

---

## Context

`ProductDetailPanel` renders as a portal into `document.body` (using `ReactDOM.createPortal`). It already has correct rendering, data fetching, scroll-locking, a backdrop, and a close button.

Four accessibility behaviours are missing:

1. **No focus-on-open**: When the panel opens, focus stays on the page behind instead of moving to the panel's close button.
2. **No focus trap**: Pressing Tab while the panel is open moves focus through the entire page rather than cycling within the panel.
3. **No Escape handler**: Pressing Escape has no effect. The only way to close the panel is to click the close button or the backdrop.
4. **No focus restore**: When the panel closes, focus lands on `document.body` rather than returning to the element that triggered the open.

---

## Requirements

### 1. Focus on open

When `productId` changes from `null` to a non-null value, move focus to the panel's close button before the user sees the panel.

### 2. Focus trap

While the panel is open, Tab and Shift+Tab must cycle through focusable elements inside the panel only. Pressing Tab on the last focusable element must wrap to the first; Shift+Tab on the first must wrap to the last.

Focusable elements are those matching:
```
button:not([disabled]), a[href], input:not([disabled]),
select:not([disabled]), textarea:not([disabled]),
[tabindex]:not([tabindex="-1"])
```

### 3. Escape to close

Pressing Escape at any time while the panel is open must call `onClose`. The key listener must fire regardless of which element on the page has focus — not only when something inside the panel is focused.

### 4. Focus restore

When the panel closes, focus must return to the element that had focus immediately before the panel opened. Capture this element at open time, not at close time.

---

## Constraints

- Do not add new npm dependencies — implement focus management directly (no focus-trap library)
- Do not modify `ProductListPage.tsx`, `ProductCard.tsx`, or any context file
- The panel must continue to use `ReactDOM.createPortal` — do not change how it is mounted
- The scroll lock (`document.body.style.overflow`) must continue to work

---

## Decision surfaces

- **Where to attach the Escape listener**: The panel is portal-rendered and sits in `document.body`. Attaching the listener to a React element via `onKeyDown` only fires when that element (or a descendant) has focus. Attaching it to `document` via `addEventListener` fires unconditionally. Only one of these is correct given the requirement.
- **When to capture the previous focus**: Use `document.activeElement` at the moment the panel opens (inside `useLayoutEffect` when `isOpen` becomes `true`). Capturing it at close time is too late — focus has already moved.
- **Cleanup**: The `document` key listener must be removed when the panel unmounts or closes (`useEffect` cleanup / dependency on `isOpen`).

---

## Expected Files to Modify

- `src/components/ProductDetailPanel.tsx`

---

## Success Criteria

1. When the panel opens, focus is on the close button
2. Pressing Tab cycles through focusable panel elements and does not reach page elements behind the panel
3. Pressing Shift+Tab cycles in reverse and wraps correctly
4. Pressing Escape closes the panel, regardless of where focus is on the page
5. After the panel closes, focus is on the element that triggered the open
6. Clicking the backdrop still closes the panel
7. All visible tests pass and the build succeeds
