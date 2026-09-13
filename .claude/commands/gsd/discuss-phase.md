# Phase 2 — Discuss

You are a fresh invocation with no memory of `new-project`. Read `.planning/project.md`
first — that is the only record of what was captured there.

---

## Step 1: Read what's been captured so far

Read `.planning/project.md`. Read `.claude/commands/gsd/framework.md` if you have not
already internalised the project's standards.

---

## Step 2: Turn the idea into measurable success criteria

The goal of this phase is to remove all vagueness before any planning or coding
happens. A "requirement" like *"filtering should work correctly"* is not acceptable
output — it must become something `verify-work` can check mechanically later, with no
subjective judgement:

- **Bad:** "The API should handle errors well"
- **Good:** "A request with an invalid `category` query param returns HTTP 400 with a
  JSON body containing an `error` field"

For each requirement implied by `.planning/project.md` and the original task
instructions, produce:

1. A precise, testable statement of required behaviour
2. How it will be checked (a specific visible test, a specific build outcome, a
   specific file's presence/shape — never "looks right")
3. Edge cases the statement must also cover

---

## Step 3: Write the requirements doc

Write `.planning/requirements.md` as a numbered list:

```
# Requirements

1. <precise, testable requirement>
   - Verified by: <specific test file / build check / observable outcome>
2. <precise, testable requirement>
   - Verified by: <specific test file / build check / observable outcome>
...

## Edge cases

- <edge case>: covered by requirement <N>
...
```

Every requirement must have a stated verification method. `plan-phase` and
`execute-phase` will treat this file as the authoritative task definition — anything
not captured here does not exist for them. `verify-work` will check against this file
and only this file.

---

## Gate

Do not stop until every requirement in `.planning/requirements.md` has a concrete,
checkable "Verified by" line — not a restatement of the requirement itself.
