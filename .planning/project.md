# Project

Task: task10
Target: frontend

## Idea

The task requires implementing four missing keyboard-accessibility behaviours in `ProductDetailPanel`: (1) move focus to the panel's close button when the panel opens, (2) trap Tab/Shift+Tab navigation so it cycles only through focusable elements inside the panel, (3) close the panel on Escape via a `document`-level event listener (not a React `onKeyDown`, because the panel is portal-rendered and focus may be outside it), and (4) restore focus to the element that had focus at the moment the panel opened, captured via `document.activeElement` inside a `useLayoutEffect`. No new npm dependencies are permitted; the implementation must be done inline in `ProductDetailPanel.tsx` only.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK10.MD`: Full requirements — four missing accessibility behaviours, constraints (no new deps, no file modifications outside ProductDetailPanel.tsx), decision surfaces (where to attach Escape listener, when to capture previous focus, cleanup obligations), and success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/components/ProductDetailPanel.tsx`: The only file to modify — contains the commented-out bug placeholder and all the existing panel logic (data fetching, scroll lock, portal rendering).
- `src/benchmark-frontend/tests/productDetailFocus.test.tsx`: The visible test file — covers open/close scenarios (backdrop click, close button, product data render). Does not directly test focus management, but tests must still pass after the change.
