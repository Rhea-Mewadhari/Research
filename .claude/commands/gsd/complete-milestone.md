# Phase 6 — Complete Milestone

You are a fresh invocation. You are only ever invoked after `.planning/verify-result.json`
has recorded `"passed": true` — the harness will not reach this phase otherwise. Your
job is to close out the run cleanly, not to re-verify anything.

---

## Step 1: Read the run's history

Read `.planning/project.md`, `.planning/requirements.md`, `.planning/roadmap.json`, and
`.planning/verify-result.json` to reconstruct what this run did.

---

## Step 2: Archive state

Write `.planning/milestone.md` summarizing the completed run:

```
# Milestone

Task: <task id>
Target: <frontend|backend>

## Requirements addressed
- <requirement>: verified — <evidence from verify-result.json>
...

## Files changed
- <file path>: <one-line summary>
...

## Checks
- pnpm test: <N passed, M failed>
- pnpm run build: <pass/fail>
```

---

## Step 3: Finalize

Make sure the working tree has nothing left uncommitted that belongs to this run —
everything under `.planning/` and every source change should be reflected in the repo
state you leave behind, since this is the last phase and nothing after it will pick up
loose ends.

---

## Gate

Do not stop until `.planning/milestone.md` exists and the working tree is clean aside
from what belongs to this run.
