# Project

Task: task10
Target: frontend

## Idea

Implement four missing keyboard-accessibility behaviours in `ProductDetailPanel`: (1) move focus to the close button the moment the panel opens, (2) trap Tab and Shift+Tab navigation inside the panel so focus never escapes to background page elements, (3) close the panel when the user presses Escape — with the listener attached to `document` so it fires regardless of where focus is, and (4) restore focus to the element that triggered the panel open when the panel closes. All changes are confined to a single component file; no new npm packages may be added.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK10.MD`: full requirements — focus-on-open, focus trap, Escape handler, focus restore, constraints (no new deps, no modifying other components, portal must stay), and decision surfaces (where to attach Escape listener, when to capture previous focus, cleanup obligations)

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/components/ProductDetailPanel.tsx`: the only file to modify — currently has a comment block marking the four missing focus-management behaviours; `panelRef` is already wired to the panel `<div>`; `isOpen` is derived from `productId !== null`
- `src/benchmark-frontend/tests/productDetailFocus.test.tsx`: visible test file covering open/close/backdrop/data-load scenarios — must pass; must not be modified
