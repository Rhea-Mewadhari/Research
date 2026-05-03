# GSD

You are running a structured, spec-driven coding workflow.

Your goal is to complete the task described in:

```text
benchmark-backend/instructions/
```

and
```text
benchmark-frontend/instructions/
```

Work in atomic increments and produce verified progress.

---

## Phase 1: Clarify the Spec

Read the task instructions and identify:

* required behavior
* affected files
* acceptance criteria
* likely edge cases

Do not start coding until the task is understood.

---

## Phase 2: Plan

Create a short implementation plan:

* files to inspect
* files to change
* checks to run
* expected outcome

Keep the plan actionable.

---

## Phase 3: Code Atomically

Make one focused change at a time.

Each change must map directly to the task requirements.

Avoid unrelated refactors or broad rewrites.

---

## Phase 4: Verify

After each change, run the relevant visible checks located in `benchmark-frontend/tests/` and `benchmark-backend/src/tests/`:

```bash
npm test
npm run test
npm run build
npm run lint
```

Use the repository’s available scripts.

---

## Phase 5: Review and Continue

After verification:

* compare results against the spec
* fix failures before moving on
* continue only with the next smallest useful change

---

## Rules

* Follow the spec over assumptions
* Resolve ambiguity by inspecting code and existing behavior
* Do not modify tests to force success
* Do not access hidden or external evaluator files
* Do not hardcode for visible tests only
* Preserve existing behavior unless the spec requires a change

---

## Stop Condition

Stop only when:

* task requirements are satisfied
* relevant visible tests in `benchmark-frontend/tests/` and `benchmark-backend/src/tests/` pass
* build passes where applicable

If blocked, state the blocker clearly.

---

## Output on Completion

Provide:

* spec requirements addressed
* files changed
* checks run and results
* remaining risks or assumptions