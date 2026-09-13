# Phase 3 — Plan

You are a fresh invocation with no memory of `new-project` or `discuss-phase`. Read
`.planning/project.md` and `.planning/requirements.md` first — those are the only
record of what was captured and decided in those phases.

No code changes happen in this phase. Its only output is `.planning/roadmap.json`.

---

## Step 1: Read what's been established so far

Read `.planning/project.md` and `.planning/requirements.md` in full.

---

## Step 2: Fan out 4 parallel investigation agents

Using your Task tool, launch 4 subagents **in parallel** (a single message with 4 Task
calls), each investigating one dimension against the current codebase and the
requirements doc:

1. **Tech stack** — what libraries/frameworks/tooling are already in use that are
   relevant to these requirements; what conventions they impose
2. **Features** — what existing features/modules overlap with or are adjacent to what's
   being asked; what already works that must not regress
3. **Architecture** — how the relevant layers are structured (e.g. routes → controllers
   → services → data, or component → hook → util); where new code belongs in that
   structure per `gsd/framework.md`
4. **Edge cases** — inputs, states, and failure modes implied by the requirements doc
   that aren't explicitly called out but that the implementation must handle

Each investigation subagent should report back findings as a short structured list, not
prose — the synthesizer in the next step needs to merge these, not re-read essays.

---

## Step 3: Synthesize

Launch one synthesizer subagent (or do this synthesis yourself if the four reports are
small enough to hold in view at once) that merges the 4 investigation reports into a
single coherent picture: what exists, what's relevant, where things belong, and what
edge cases must be handled. Resolve any contradictions between the four reports
explicitly rather than silently picking one.

---

## Step 4: Roadmap

Launch one roadmapper subagent (or do this yourself) that turns the synthesis into an
ordered, atomic task list — the same shape as an implementation plan: each task tied to
a specific requirement from `.planning/requirements.md`, sequenced so earlier tasks
don't break later ones.

---

## Step 5: Write the roadmap

Write `.planning/roadmap.json`:

```json
{
  "investigations": {
    "techStack": ["<finding>", "..."],
    "features": ["<finding>", "..."],
    "architecture": ["<finding>", "..."],
    "edgeCases": ["<finding>", "..."]
  },
  "tasks": [
    {
      "id": "task-1",
      "requirement": "<requirement number/text from requirements.md>",
      "description": "<what to change and where>",
      "files": ["<file path>", "..."]
    }
  ]
}
```

---

## Constraints

- No file under `tests/` or `src/tests/` may be listed as a file to change
- Every task must map to a requirement in `.planning/requirements.md` — do not plan
  refactors or improvements the requirements doc doesn't call for
- Do not write any implementation code in this phase

---

## Gate

Do not stop until `.planning/roadmap.json` exists, contains all 4 investigation
dimensions, and every task has a `requirement` reference.
