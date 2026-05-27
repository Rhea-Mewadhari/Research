# Phase 5 — Review and Continue

After verification passes, assess progress against the spec and decide what to do next.

---

## Review checklist

For each requirement from Phase 1:

- [ ] Implemented?
- [ ] Verified by visible tests passing?
- [ ] No regressions introduced in previously passing tests?

---

## Decision logic

```
All requirements implemented AND all visible tests pass AND build passes
  → STOP. Produce the final output below.

Requirements still remaining AND no blocker
  → Return to Phase 3 (Code) with the next item from the Phase 2 plan.

A failure persists after a fix attempt
  → Document the blocker clearly and stop. Do not loop indefinitely.
```

---

## Final output format

When stopping (complete or blocked), produce this summary:

```
Requirements addressed:
- <requirement>: ✓ implemented / ✗ not implemented

Files changed:
- <file path>: <one-line summary of change>

Checks run:
- pnpm test: <N passed, M failed>
- pnpm run build: <pass / fail>
- pnpm run lint: <pass / fail / not run>

Remaining risks or assumptions:
- <item, or "none">
```

---

## Stop condition

Stop only when all three are true:

1. All task requirements from Phase 1 are implemented
2. All visible tests pass
3. The build passes

If blocked with no valid path forward, state the blocker explicitly. Do not attempt further changes that violate the constraint rules in `gsd/framework.md`.
