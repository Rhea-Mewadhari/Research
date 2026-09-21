# Project

Task: task10
Target: frontend

## Idea

The task requires implementing four missing keyboard-accessibility behaviours in the existing `ProductDetailPanel` component: (1) move focus to the close button when the panel opens; (2) trap Tab and Shift+Tab navigation within the panel while it is open; (3) close the panel by pressing Escape via a `document`-level event listener (not a React `onKeyDown` handler, because the panel is portal-rendered); and (4) restore focus to the element that was active when the panel opened, captured at open time, not close time. The panel already renders correctly as a `ReactDOM.createPortal` with scroll-locking and a backdrop — only the focus management logic needs to be added.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK10.MD`: Full task description — objective, context, four requirements, constraints, decision surfaces, expected files, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/components/ProductDetailPanel.tsx`: The only file to modify; currently has a comment block explicitly marking the four missing focus-management behaviours (lines 53–59)
- `src/benchmark-frontend/tests/productDetailFocus.test.tsx`: The visible test file for this task; must pass without modification
