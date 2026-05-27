# Phase 3 — Code

Implement one item from the Phase 2 plan. One change. Then stop and verify.

---

## Atomic change discipline

- Make exactly one change per pass through this phase
- A "change" is the smallest unit that can be verified independently: a single function implementation, a single route addition, a single type update
- After each change, proceed immediately to Phase 4 (Verify) — do not continue to the next plan item without verifying
- Do not batch multiple plan items into a single edit session

---

## Standards (from `gsd/framework.md`)

### Naming
- `camelCase` for variables, functions, and parameters
- `PascalCase` for types, interfaces, and React components
- `SCREAMING_SNAKE_CASE` for module-level primitive constants
- `use` prefix for custom React hooks

### TypeScript
- No `any` — use a specific type or a narrowed union
- Explicit return types on exported functions
- `import type` for type-only imports
- No `@ts-ignore`, no non-null assertions (`!`) without justification

### React
- Functional components only
- `useMemo` for derived values, not `useEffect`

### Express
- Controllers handle HTTP only; services handle logic
- Do not let raw query parameters flow into the service layer unprocessed

---

## What is not allowed

- Modifying any file under `tests/` or `src/tests/`
- Hardcoding values to match specific test fixtures rather than implementing the general logic
- Adding `console.log` debug statements
- Making changes outside the scope of the current plan item
- Using `npm` instead of `pnpm`

---

## After making the change

State clearly before moving to Phase 4:

```
Changed: <file path>
What: <one-line description of what changed>
Maps to requirement: <requirement name from Phase 1>
```
