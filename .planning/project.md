# Project

Task: task10
Target: frontend

## Idea

The task requires implementing four keyboard-accessibility behaviours in `ProductDetailPanel` that are currently missing. When the panel opens, focus must move to the close button. While the panel is open, Tab/Shift+Tab must cycle only through focusable elements inside the panel (focus trap). Pressing Escape anywhere on the page must call `onClose`. When the panel closes, focus must return to the element that was active when the panel opened. No new npm packages may be added; all focus management must be done with native DOM APIs via React hooks.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK10.MD`: full requirements, constraints, decision surfaces, and success criteria for the focus-management implementation

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/components/ProductDetailPanel.tsx`: the only file to modify; currently has a comment block explicitly marking the four missing focus-management behaviours (lines 53–59)
