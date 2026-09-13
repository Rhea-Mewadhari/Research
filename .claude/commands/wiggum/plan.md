# Wiggum — Plan

You are generating the implementation plan for a Ralph Wiggum Loop run. This is the
**only** step that runs with a full view of the task before the loop starts restarting
with a fresh context each iteration — make this plan good enough that a context-free
agent reading only this file, the spec, and the current repo state can pick up any
phase and know what to do.

---

## Step 1: Read the task

Task instructions are at:

```
benchmark-frontend/instructions/
benchmark-backend/instructions/
```

Read every file in the instructions directory for your target.

---

## Step 2: Break the task into discrete phases

Split the work into an ordered list of phases. Each phase should be:

- **Self-contained** — completable by an agent with no memory of any other phase, using
  only the spec, this plan, and the code already committed to the repo
- **Independently verifiable** — it's possible to tell from the repo state and test
  results whether the phase succeeded
- **As small as the task naturally allows** — prefer more, smaller phases over few,
  large ones; a phase that requires holding the whole task in your head to complete
  defeats the point of the loop

Do not write any implementation code in this step.

---

## Step 3: Write the plan

Write `.wiggum/plan.json` with this exact shape:

```json
{
  "taskId": "<task id>",
  "target": "<frontend|backend>",
  "phases": [
    { "id": "phase-1", "title": "<short description>", "status": "open", "notes": "" },
    { "id": "phase-2", "title": "<short description>", "status": "open", "notes": "" }
  ]
}
```

- `status` starts as `"open"` for every phase
- `notes` starts empty — later iterations fill it in when a phase fails
- Order matters: phases are picked up in array order by whichever one is still `"open"`

---

## Gate

Do not stop until `.wiggum/plan.json` exists, is valid JSON, and every phase has an
`id`, a `title`, and `status: "open"`.
