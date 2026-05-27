# Phase 2 — Plan

Translate the task summary from Phase 1 into a concrete, ordered implementation plan before touching any code.

---

## Step 1: Inspect before planning

For each affected file identified in Phase 1, read it now. You must understand the current shape of the code before deciding what to change.

---

## Step 2: Produce the implementation plan

Write the plan in this format:

```
Files to inspect (read before touching):
- <file>: <what to look for>

Ordered changes:
1. <file path> — <what to change and why, tied to a Phase 1 requirement>
2. <file path> — <what to change and why>
...

Check sequence after each change:
1. pnpm test
2. pnpm run build
3. pnpm run lint (if configured)

Expected outcome:
- <what passing looks like>

Risks / assumptions:
- <item>
```

---

## Constraints

- Each entry in the ordered changes list must map to a named requirement from Phase 1
- Changes must be sequenced so earlier changes do not break later ones
- The total number of file changes should be the minimum necessary to satisfy the spec
- Do not plan refactors, cleanups, or improvements unless they are required to implement a requirement correctly

---

## Gate

Do not begin coding (Phase 3) until:

- The ordered changes list is complete
- Every change has a clear justification tied to a Phase 1 requirement
- You have read (not just listed) every file you plan to touch
