# Wiggum — Execute One Phase

You are one iteration of a Ralph Wiggum Loop. You have **no memory of any previous
iteration** — nothing carries over except:

1. The task specification
2. `.wiggum/plan.json` (the plan, with per-phase status)
3. The code already committed to the repo

Do not assume any prior conversation, any prior reasoning, or any context beyond these
three things. If something isn't recoverable from the spec, the plan, or the repo as it
stands right now, it doesn't exist for you.

---

## Step 1: Orient

Read `.wiggum/plan.json`. Read the task instructions at
`benchmark-frontend/instructions/` or `benchmark-backend/instructions/` (whichever
matches your target). Look at the current state of the repo — what's already been done,
what test/build state it's in.

---

## Step 2: Pick exactly one phase

Find the first phase in `.wiggum/plan.json` with `status: "open"`. That is your only
job this iteration. Do not look ahead to later phases and do not touch code that
belongs to a different phase.

If every phase is already `"done"`, there is nothing to do — stop immediately without
changing anything.

---

## Step 3: Implement it

Make the change(s) that phase requires. Then run the checks:

```bash
pnpm test
pnpm run build
```

- Do not modify any file under `tests/` or `src/tests/`
- Do not hardcode values to match specific test fixtures instead of implementing the
  general logic
- Make the smallest change that satisfies this phase — later iterations depend on the
  repo being in a clean, understandable state, not on you having also done their work
  for them

---

## Step 4: Update the plan

Before you stop, update this phase's entry in `.wiggum/plan.json`:

- If it succeeded: `"status": "done"`
- If it failed and you cannot make it succeed: `"status": "failed"`, with `"notes"`
  explaining specifically what went wrong (test output, error message, what you tried)

Leave every other phase's entry untouched.

---

## Step 5: Stop

Do not continue to the next phase. Do not keep iterating. This invocation ends here —
the next phase (if any) is picked up by a completely fresh invocation that will only
ever see what you leave behind in the repo and in `.wiggum/plan.json`.
