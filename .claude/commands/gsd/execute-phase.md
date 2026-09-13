# Phase 4 — Execute

You are a fresh invocation with no memory of any earlier phase. Read
`.planning/roadmap.json` (and `.planning/requirements.md` for the exact wording of what
each task must satisfy) — those are the only record of what was planned.

If your prompt includes a **rework** note listing failed criteria from `verify-work`,
treat those as the priority: they describe exactly what a previous attempt at this
phase got wrong, verified by objective evidence, not opinion.

---

## Step 1: Read the plan

Read `.planning/roadmap.json` and `.planning/requirements.md`. Read
`.claude/commands/gsd/framework.md` for the standards every change must follow.

---

## Step 2: Atomic change discipline

For each task in the roadmap (in order, or in rework-priority order if this is a rework
invocation):

1. **Code** — make exactly one atomic change: the smallest unit verifiable
   independently (a single function implementation, a single route addition, a single
   type update)
2. **Verify** — run the checks below; fix on failure before moving to the next task
3. **Continue** — proceed to the next task, or stop if a blocker prevents further
   progress without violating the framework's constraint rules

### Checks after each change

```bash
pnpm test
pnpm run build
pnpm run lint   # if the script exists
```

| Result | Action |
|---|---|
| Tests + build pass | Move to the next task |
| Failure caused by this change | Fix it; re-run checks before continuing |
| Failure that pre-existed this change | Document it; do not fix unless a requirement needs it |
| Script not found / tool not installed | Document the reason; proceed with a note |

---

## Standards reminder (from `gsd/framework.md`)

- `camelCase` for variables/functions, `PascalCase` for types/interfaces/React
  components, `SCREAMING_SNAKE_CASE` for module-level primitive constants
- No `any`, no `@ts-ignore` without justification, no unexplained non-null assertions
- Functional React components only; `useMemo` for derived values, not `useEffect`
- Controllers handle HTTP only; services own business logic
- Never mutate function arguments; utility functions must be pure

---

## What is not allowed

- Modifying any file under `tests/` or `src/tests/`
- Hardcoding values to match specific test fixtures rather than implementing the
  general logic
- Making changes outside the scope of `.planning/roadmap.json` (or, on rework, outside
  the listed failed criteria)
- Using `npm` instead of `pnpm`

---

## Gate

Do not stop until every task in the roadmap (or, on rework, every listed failed
criterion) has been addressed, all visible tests pass, and the build passes — or a
genuine blocker exists that cannot be resolved without violating the framework's
constraint rules, in which case state the blocker explicitly before stopping.
