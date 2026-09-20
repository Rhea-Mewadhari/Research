# Project

Task: task10
Target: frontend

## Idea

`ProductDetailPanel` is a portal-rendered React component that already handles rendering, data fetching, scroll-locking, a backdrop, and a close button — but it has no keyboard accessibility. The task requires adding four focus-management behaviours: (1) move focus to the close button when the panel opens, (2) trap Tab/Shift+Tab cycling within the panel's focusable elements, (3) attach a `document`-level Escape key listener to call `onClose` regardless of where focus sits on the page, and (4) capture the element that had focus before the panel opened and restore focus to it when the panel closes.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK10.MD`: Full requirements, constraints, decision surfaces, expected file to modify, and success criteria for focus management in `ProductDetailPanel`.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/components/ProductDetailPanel.tsx`: The only file that needs to change — contains the bug comment explicitly listing the four missing behaviours. Must add `useLayoutEffect` for focus-on-open and previous-focus capture, a `useEffect` for the document-level Escape listener, and a `onKeyDown` handler on the panel div for Tab-trap logic.
- `src/benchmark-frontend/tests/`: Visible test files for the frontend — must not be modified, but relevant tests will exercise the focus behaviours added.
